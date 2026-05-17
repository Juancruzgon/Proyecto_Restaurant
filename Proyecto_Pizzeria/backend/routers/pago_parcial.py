from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from backend.core.database import get_session
from models.usuario import Usuario
from models.pago_parcial import PagoParcial
from models.pedido import Pedido, DetallePedido
from models.producto import Producto
from backend.core.auth import get_current_user
from decimal import Decimal
import pydantic
from typing import List

class ItemPago(pydantic.BaseModel):
    detalle_id: int
    cantidad: int
    metodo: str
    monto: Decimal

class PagoParcialRequest(pydantic.BaseModel):
    items: List[ItemPago]

router = APIRouter(
    prefix="/pagos-parciales",
    tags=["pagos-parciales"]
)

@router.get("/pedido/{pedido_id}")
def obtener_pagos_parciales(pedido_id: int, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    """Devuelve los pagos parciales de un pedido y el estado de cada detalle."""
    detalles = session.exec(
        select(DetallePedido).where(DetallePedido.pedido_id == pedido_id)
    ).all()

    pagos = session.exec(
        select(PagoParcial).where(PagoParcial.pedido_id == pedido_id)
    ).all()

    resultado = []
    for d in detalles:
        producto = session.get(Producto, d.producto_id)
        cantidad_pagada = sum(p.cantidad for p in pagos if p.detalle_id == d.id)
        resultado.append({
            "detalle_id":      d.id,
            "producto_id":     d.producto_id,
            "nombre":          producto.nombre if producto else f"Producto {d.producto_id}",
            "cantidad_total":  d.cantidad,
            "cantidad_pagada": cantidad_pagada,
            "cantidad_pendiente": d.cantidad - cantidad_pagada,
            "precio_unitario": float(d.precio_unitario),
            "subtotal":        float(d.subtotal),
        })

    total_pedido  = float(session.get(Pedido, pedido_id).total)
    total_pagado  = sum(float(p.monto) for p in pagos)
    total_pendiente = total_pedido - total_pagado

    return {
        "detalles":        resultado,
        "total_pedido":    total_pedido,
        "total_pagado":    total_pagado,
        "total_pendiente": total_pendiente,
        "pagos":           [{"id": p.id, "detalle_id": p.detalle_id, "cantidad": p.cantidad, "metodo": p.metodo, "monto": float(p.monto)} for p in pagos],
    }

@router.post("/pedido/{pedido_id}")
def registrar_pago_parcial(
    pedido_id: int,
    data: PagoParcialRequest,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user)
):
    pedido = session.get(Pedido, pedido_id)
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    if pedido.estado_id == 4:
        raise HTTPException(status_code=400, detail="El pedido ya está pagado")

    for item in data.items:
        detalle = session.get(DetallePedido, item.detalle_id)
        if not detalle:
            raise HTTPException(status_code=404, detail=f"Detalle {item.detalle_id} no encontrado")

        # Verificar que no se pague más de lo pendiente
        ya_pagado = session.exec(
            select(PagoParcial).where(PagoParcial.detalle_id == item.detalle_id)
        ).all()
        cantidad_ya_pagada = sum(p.cantidad for p in ya_pagado)
        if cantidad_ya_pagada + item.cantidad > detalle.cantidad:
            raise HTTPException(
                status_code=400,
                detail=f"Se intenta pagar {item.cantidad} unidades pero solo quedan {detalle.cantidad - cantidad_ya_pagada} pendientes"
            )

        nuevo_pago = PagoParcial(
            pedido_id=pedido_id,
            detalle_id=item.detalle_id,
            cantidad=item.cantidad,
            metodo=item.metodo,
            monto=item.monto,
        )
        session.add(nuevo_pago)

        # Actualizar cantidad_pagada en DetallePedido
        detalle.cantidad_pagada = cantidad_ya_pagada + item.cantidad
        session.add(detalle)

    session.commit()

    # Verificar si todos los items están pagados — cerrar pedido automáticamente
    detalles = session.exec(
        select(DetallePedido).where(DetallePedido.pedido_id == pedido_id)
    ).all()
    todos_pagados = all(d.cantidad_pagada >= d.cantidad for d in detalles)

    if todos_pagados:
        from crud.pedido import descontar_stock_pedido
        from models.insumo import Insumo, MovimientoStock
        from models.caja import Caja

        pedido.estado_id = 4
        pedido.activo    = False

        # Método de pago — mixto si hay más de uno
        todos_pagos = session.exec(
            select(PagoParcial).where(PagoParcial.pedido_id == pedido_id)
        ).all()
        metodos = list(set(p.metodo for p in todos_pagos))
        pedido.metodo_pago = metodos[0] if len(metodos) == 1 else "mixto"

        if pedido.mesa_id:
            from models.mesa import Mesa
            mesa = session.get(Mesa, pedido.mesa_id)
            if mesa:
                mesa.estado_id = 1
                session.add(mesa)

        descontar_stock_pedido(pedido_id, detalles, session)
        session.add(pedido)
        session.commit()

        return {"detail": "Todos los items pagados — pedido cerrado", "pedido_cerrado": True}

    session.commit()
    return {"detail": "Pago parcial registrado", "pedido_cerrado": False}