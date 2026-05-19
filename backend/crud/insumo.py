# crud/insumo.py
from datetime import date
from sqlmodel import Session, select
from models.insumo import Insumo, MovimientoStock
from models.receta import RecetaProducto
from models.gasto import Gasto
from models.categoria_gasto import CategoriaGasto
import schemas
from fastapi import HTTPException

def obtener_insumos(session: Session, categoria_id: int = None):
    statement = select(Insumo)
    if categoria_id:
        statement = statement.where(Insumo.categoria_id == categoria_id)
    return session.exec(statement).all()

def crear_insumo(insumo: schemas.InsumoCreate, session: Session):
    nuevo_insumo = Insumo(**insumo.model_dump())
    session.add(nuevo_insumo)
    session.commit()
    session.refresh(nuevo_insumo)
    return nuevo_insumo

def modificar_insumo(insumo_id: int, insumo: schemas.InsumoModify, session: Session):
    insumo_existente = session.exec(select(Insumo).where(Insumo.id == insumo_id)).first()
    if not insumo_existente:
        raise HTTPException(status_code=404, detail="Insumo no encontrado")
    for attr, value in insumo.model_dump(exclude_unset=True).items():
        setattr(insumo_existente, attr, value)
    session.add(insumo_existente)
    session.commit()
    session.refresh(insumo_existente)
    return insumo_existente

def eliminar_insumo(insumo_id: int, session: Session):
    insumo_existente = session.exec(select(Insumo).where(Insumo.id == insumo_id)).first()
    if not insumo_existente:
        raise HTTPException(status_code=404, detail="Insumo no encontrado")
    session.delete(insumo_existente)
    session.commit()
    return {"detail": "Insumo eliminado"}

def agregar_compra(insumo_id: int, cantidad: float, monto: float, usuario_id: int, session: Session):
    insumo_existente = session.exec(select(Insumo).where(Insumo.id == insumo_id)).first()
    if not insumo_existente:
        raise HTTPException(status_code=404, detail="Insumo no encontrado")

    # 1. Actualizar stock
    insumo_existente.stock_actual += cantidad
    movimiento = MovimientoStock(
        nro_id=insumo_id,
        id_insumo=insumo_id,
        cantidad=cantidad,
        tipo_movimiento="compra",
    )
    session.add(movimiento)
    session.add(insumo_existente)

    # 2. Buscar o crear categoría "Insumos" en gastos
    cat_gasto = session.exec(
        select(CategoriaGasto).where(CategoriaGasto.nombre == "Insumos")
    ).first()
    if not cat_gasto:
        cat_gasto = CategoriaGasto(nombre="Insumos")
        session.add(cat_gasto)
        session.flush()  # para obtener el id sin hacer commit

    # 3. Crear gasto
    gasto = Gasto(
        nombre=f"Compra: {insumo_existente.nombre}",
        descripcion=f"{cantidad} {insumo_existente.unidad_medida} de {insumo_existente.nombre}",
        monto=monto,
        categoria_id=cat_gasto.id,
        usuario_id=usuario_id,
        cantidad=cantidad,
    )
    session.add(gasto)
    session.commit()
    session.refresh(insumo_existente)
    return insumo_existente

def descontar_stock_pedido(pedido_id: int, detalles: list, session: Session):
    from models.producto import Producto
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

def revertir_stock_pedido(pedido_id: int, detalles: list, session: Session):
    for detalle in detalles:
        recetas = session.exec(
            select(RecetaProducto).where(RecetaProducto.producto_id == detalle.producto_id)
        ).all()
        for receta in recetas:
            insumo = session.get(Insumo, receta.insumo_id)
            if not insumo:
                continue
            cantidad = receta.cantidad * detalle.cantidad
            insumo.stock_actual += cantidad
            session.add(insumo)
            session.add(MovimientoStock(
                nro_id=insumo.id,
                id_insumo=insumo.id,
                cantidad=cantidad,
                tipo_movimiento="reversion",
                nota=f"Cancelación pedido #{pedido_id}",
            ))
    session.commit()

def obtener_receta(producto_id: int, session: Session):
    return session.exec(
        select(RecetaProducto).where(RecetaProducto.producto_id == producto_id)
    ).all()

def agregar_ingrediente_receta(receta: schemas.RecetaProductoCreate, session: Session):
    nuevo = RecetaProducto(**receta.model_dump())
    session.add(nuevo)
    session.commit()
    session.refresh(nuevo)
    return nuevo

def eliminar_ingrediente_receta(receta_id: int, session: Session):
    rec = session.get(RecetaProducto, receta_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Ingrediente no encontrado")
    session.delete(rec)
    session.commit()
    return {"detail": "Ingrediente eliminado"}

def modificar_ingrediente_receta(receta_id: int, datos: schemas.RecetaProductoModify, session: Session):
    rec = session.get(RecetaProducto, receta_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Ingrediente no encontrado")
    for attr, value in datos.model_dump(exclude_unset=True).items():
        setattr(rec, attr, value)
    session.add(rec)
    session.commit()
    session.refresh(rec)
    return rec