from datetime import date
from sqlmodel import Session, select
from models.pedido import Pedido, DetallePedido
from models.mesa import Mesa
from models.producto import Producto
from models.insumo import Insumo, MovimientoStock
from models.receta import RecetaProducto
from models.caja import Caja
import schemas
from fastapi import HTTPException

TRANSICIONES_VALIDAS = {
    2: 3,
    3: 4,
}

# ── Stock ────────────────────────────────────────────────────

def descontar_stock_pedido(pedido_id: int, detalles: list, session: Session):
    for detalle in detalles:
        producto = session.get(Producto, detalle.producto_id)
        if not producto:
            continue

        if producto.tipo == "con_receta":
            recetas = session.exec(
                select(RecetaProducto).where(RecetaProducto.producto_id == detalle.producto_id)
            ).all()
            for receta in recetas:
                insumo = session.get(Insumo, receta.insumo_id)
                if not insumo:
                    continue
                cantidad = receta.cantidad * detalle.cantidad
                insumo.stock_actual -= cantidad
                session.add(insumo)
                session.add(MovimientoStock(
                    nro_id=insumo.id,
                    id_insumo=insumo.id,
                    cantidad=-cantidad,
                    tipo_movimiento="venta",
                    nota=f"Pedido #{pedido_id}",
                ))

        elif producto.tipo == "sin_receta" and producto.insumo_id:
            insumo = session.get(Insumo, producto.insumo_id)
            if insumo:
                insumo.stock_actual -= detalle.cantidad
                session.add(insumo)
                session.add(MovimientoStock(
                    nro_id=insumo.id,
                    id_insumo=insumo.id,
                    cantidad=-detalle.cantidad,
                    tipo_movimiento="venta",
                    nota=f"Pedido #{pedido_id}",
                ))

    session.commit()

# ── Pedidos ──────────────────────────────────────────────────

def obtener_pedidos(session: Session, mesa_id: int = None, caja_id: int = None, pagados: bool = False):
    if pagados:
        # Pedidos pagados (activo=False, estado_id=4)
        statement = select(Pedido).where(Pedido.estado_id == 4)
        if caja_id:
            statement = statement.where(Pedido.caja_id == caja_id)
    else:
        statement = select(Pedido).where(Pedido.activo == True)
        if mesa_id:
            statement = statement.where(Pedido.mesa_id == mesa_id)
        if caja_id:
            statement = statement.where(Pedido.caja_id == caja_id)
    return session.exec(statement).all()

def crear_pedido(pedido: schemas.PedidoCreate, session: Session):
    from models.caja import Caja

    # 1. Calcular nro_pedido
    ultimo_pedido = session.exec(
        select(Pedido)
        .where(Pedido.fecha == date.today())
        .order_by(Pedido.nro_pedido.desc())
    ).first()
    nro_pedido = (ultimo_pedido.nro_pedido + 1) if ultimo_pedido else 1

    # 2. Crear pedido
    nuevo_pedido = Pedido(**pedido.model_dump(), estado_id=2, nro_pedido=nro_pedido)

    # 3. Asignar caja activa si existe
    caja_activa = session.exec(select(Caja).where(Caja.activo == True)).first()
    if caja_activa:
        nuevo_pedido.caja_id = caja_activa.id

    # 4. Validar y ocupar mesa
    if pedido.mesa_id:
        mesa = session.exec(select(Mesa).where(Mesa.id == pedido.mesa_id)).first()
        if not mesa:
            raise HTTPException(status_code=404, detail="Mesa no encontrada")
        if mesa.estado_id != 1:
            raise HTTPException(status_code=400, detail="La mesa ya está ocupada")
        mesa.estado_id = 2
        session.add(mesa)

    session.add(nuevo_pedido)
    session.commit()
    session.refresh(nuevo_pedido)
    return nuevo_pedido

def modificar_pedido(pedido_id: int, pedido: schemas.PedidoModify, session: Session):
    pedido_existente = session.exec(select(Pedido).where(Pedido.id == pedido_id)).first()
    if not pedido_existente:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    for attr, value in pedido.model_dump(exclude_unset=True).items():
        setattr(pedido_existente, attr, value)
    session.add(pedido_existente)
    session.commit()
    session.refresh(pedido_existente)
    return pedido_existente


def eliminar_pedido(pedido_id: int, session: Session):
    pedido_existente = session.exec(select(Pedido).where(Pedido.id == pedido_id)).first()
    if not pedido_existente:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    pedido_existente.activo = False
    if pedido_existente.mesa_id:
        mesa = session.exec(select(Mesa).where(Mesa.id == pedido_existente.mesa_id)).first()
        if mesa:
            mesa.estado_id = 1
            session.add(mesa)
    session.add(pedido_existente)
    session.commit()
    session.refresh(pedido_existente)
    return pedido_existente


def cambiar_estado_pedido(pedido_id: int, session: Session):
    pedido_existente = session.exec(select(Pedido).where(Pedido.id == pedido_id)).first()
    if not pedido_existente:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    siguiente_estado = TRANSICIONES_VALIDAS.get(pedido_existente.estado_id)
    if not siguiente_estado:
        raise HTTPException(status_code=400, detail="No existen más estados")
    pedido_existente.estado_id = siguiente_estado
    if siguiente_estado == 4:
        pedido_existente.activo = False
        if pedido_existente.mesa_id:
            mesa = session.exec(select(Mesa).where(Mesa.id == pedido_existente.mesa_id)).first()
            if mesa:
                mesa.estado_id = 1
                session.add(mesa)
        detalles = session.exec(
            select(DetallePedido).where(DetallePedido.pedido_id == pedido_id)
        ).all()
        descontar_stock_pedido(pedido_id, detalles, session)
    session.add(pedido_existente)
    session.commit()
    session.refresh(pedido_existente)
    return pedido_existente


def cobrar_pedido(pedido_id: int, pagos: list, session: Session):
    from models.pago import Pago
    from models.caja import Caja

    pedido_existente = session.exec(select(Pedido).where(Pedido.id == pedido_id)).first()
    if not pedido_existente:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")

    # Validar que los pagos cubran el total
    total_pagado = sum(float(p.monto) for p in pagos)
    if total_pagado < float(pedido_existente.total):
        raise HTTPException(status_code=400, detail="El monto pagado no cubre el total del pedido")

    # Registrar pagos
    metodos = list(set(p.metodo for p in pagos))
    metodo_str = metodos[0] if len(metodos) == 1 else "mixto"

    for pago in pagos:
        nuevo_pago = Pago(
            pedido_id=pedido_id,
            metodo=pago.metodo,
            monto=pago.monto,
        )
        session.add(nuevo_pago)

    pedido_existente.estado_id   = 4
    pedido_existente.activo      = False
    pedido_existente.metodo_pago = metodo_str

    if pedido_existente.mesa_id:
        mesa = session.exec(select(Mesa).where(Mesa.id == pedido_existente.mesa_id)).first()
        if mesa:
            mesa.estado_id = 1
            session.add(mesa)

    detalles = session.exec(
        select(DetallePedido).where(DetallePedido.pedido_id == pedido_id)
    ).all()
    descontar_stock_pedido(pedido_id, detalles, session)

    session.add(pedido_existente)
    session.commit()
    session.refresh(pedido_existente)
    return pedido_existente


def detalle_pedido(pedido_id: int, detalle: schemas.DetallePedidoCreate, session: Session):
    pedido_existente = session.exec(select(Pedido).where(Pedido.id == pedido_id)).first()
    if not pedido_existente:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    producto = session.exec(select(Producto).where(Producto.id == detalle.producto_id)).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    nuevo_detalle = DetallePedido(
        pedido_id=pedido_id,
        producto_id=detalle.producto_id,
        cantidad=detalle.cantidad,
        precio_unitario=producto.precio,
        subtotal=producto.precio * detalle.cantidad,
        nota=detalle.nota,
    )
    pedido_existente.total += nuevo_detalle.subtotal
    session.add(pedido_existente)
    session.add(nuevo_detalle)
    session.commit()
    session.refresh(nuevo_detalle)
    return nuevo_detalle


def mostrar_detalle_pedido(pedido_id: int, session: Session):
    pedido_existente = session.exec(select(Pedido).where(Pedido.id == pedido_id)).first()
    if not pedido_existente:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    detalles = session.exec(
        select(DetallePedido).where(DetallePedido.pedido_id == pedido_id)
    ).all()
    resultado = []
    for d in detalles:
        producto = session.get(Producto, d.producto_id)
        resultado.append({
            "id": d.id,
            "pedido_id": d.pedido_id,
            "producto_id": d.producto_id,
            "cantidad": d.cantidad,
            "precio_unitario": float(d.precio_unitario),
            "subtotal": float(d.subtotal),
            "nombre": producto.nombre if producto else None,
            "imagen_url": producto.imagen_url if producto else None,
            "nota": d.nota,
        })
    return resultado


def eliminar_producto_pedido(detalle_id: int, session: Session):
    detalle_existente = session.exec(select(DetallePedido).where(DetallePedido.id == detalle_id)).first()
    if not detalle_existente:
        raise HTTPException(status_code=404, detail="Detalle de pedido no encontrado")
    pedido_existente = session.exec(select(Pedido).where(Pedido.id == detalle_existente.pedido_id)).first()
    if not pedido_existente:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    pedido_existente.total -= detalle_existente.subtotal
    session.add(pedido_existente)
    session.delete(detalle_existente)
    session.commit()
    return {"detail": "Producto eliminado del pedido"}


def modificar_nota_detalle(detalle_id: int, nota, session: Session):
    detalle_existente = session.exec(select(DetallePedido).where(DetallePedido.id == detalle_id)).first()
    if not detalle_existente:
        raise HTTPException(status_code=404, detail="Detalle de pedido no encontrado")
    detalle_existente.nota = nota
    session.add(detalle_existente)
    session.commit()
    session.refresh(detalle_existente)
    return detalle_existente


def modificar_cantidad_pedido(detalle_id: int, cantidad: int, session: Session):
    detalle_existente = session.exec(select(DetallePedido).where(DetallePedido.id == detalle_id)).first()
    if not detalle_existente:
        raise HTTPException(status_code=404, detail="Detalle de pedido no encontrado")
    pedido_existente = session.exec(select(Pedido).where(Pedido.id == detalle_existente.pedido_id)).first()
    if not pedido_existente:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    pedido_existente.total -= detalle_existente.subtotal
    detalle_existente.cantidad = cantidad
    detalle_existente.subtotal = detalle_existente.precio_unitario * cantidad
    pedido_existente.total += detalle_existente.subtotal
    session.add(pedido_existente)
    session.add(detalle_existente)
    session.commit()
    session.refresh(detalle_existente)
    return detalle_existente