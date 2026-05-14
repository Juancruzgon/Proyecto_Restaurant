from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from database import get_session
from models.usuario import Usuario
from models.pedido import Pedido, DetallePedido
from models.producto import Producto
from models.categoria_producto import CategoriaProducto
from auth import get_current_user
from datetime import date, datetime
from decimal import Decimal

router = APIRouter(
    prefix="/reportes",
    tags=["reportes"]
)

def get_pedidos_pagados(session: Session, desde: date, hasta: date):
    return session.exec(
        select(Pedido).where(
            Pedido.estado_id == 4,
            Pedido.fecha >= desde,
            Pedido.fecha <= hasta,
        )
    ).all()

def calcular_reporte(pedidos: list, session: Session):
    if not pedidos:
        return {
            "total_ventas": 0,
            "total_pedidos": 0,
            "ticket_promedio": 0,
            "por_hora": [],
            "por_categoria": [],
            "productos_top": [],
        }

    total_ventas  = sum(float(p.total) for p in pedidos)
    total_pedidos = len(pedidos)
    ticket_promedio = total_ventas / total_pedidos if total_pedidos else 0

    # Ventas por hora
    por_hora = {}
    for p in pedidos:
        h = p.hora.hour if p.hora else 0
        por_hora[h] = por_hora.get(h, 0) + float(p.total)
    por_hora_lista = [{"hora": f"{h:02d}:00", "ventas": round(v, 2)} for h, v in sorted(por_hora.items())]

    # Detalles de todos los pedidos
    pedido_ids = [p.id for p in pedidos]
    detalles = session.exec(
        select(DetallePedido).where(DetallePedido.pedido_id.in_(pedido_ids))
    ).all()

    # Productos más vendidos
    productos_count = {}
    for d in detalles:
        if d.producto_id not in productos_count:
            productos_count[d.producto_id] = {"cantidad": 0, "total": 0}
        productos_count[d.producto_id]["cantidad"] += d.cantidad
        productos_count[d.producto_id]["total"]    += float(d.subtotal)

    productos_top = []
    for prod_id, datos in sorted(productos_count.items(), key=lambda x: x[1]["cantidad"], reverse=True)[:10]:
        producto = session.get(Producto, prod_id)
        if producto:
            productos_top.append({
                "id":       prod_id,
                "nombre":   producto.nombre,
                "cantidad": datos["cantidad"],
                "total":    round(datos["total"], 2),
            })

    # Ventas por categoría
    cat_ventas = {}
    for d in detalles:
        producto = session.get(Producto, d.producto_id)
        if not producto:
            continue
        cat = session.get(CategoriaProducto, producto.categoria_id)
        nombre_cat = cat.nombre if cat else "Sin categoría"
        cat_ventas[nombre_cat] = cat_ventas.get(nombre_cat, 0) + float(d.subtotal)

    por_categoria = [
        {"categoria": k, "total": round(v, 2)}
        for k, v in sorted(cat_ventas.items(), key=lambda x: x[1], reverse=True)
    ]

    return {
        "total_ventas":    round(total_ventas, 2),
        "total_pedidos":   total_pedidos,
        "ticket_promedio": round(ticket_promedio, 2),
        "por_hora":        por_hora_lista,
        "por_categoria":   por_categoria,
        "productos_top":   productos_top,
    }


@router.get("/ventas")
def reporte_ventas(
    desde: date,
    hasta: date,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user)
):
    pedidos = get_pedidos_pagados(session, desde, hasta)
    return calcular_reporte(pedidos, session)


@router.get("/producto/{producto_id}")
def reporte_producto(
    producto_id: int,
    desde: date,
    hasta: date,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user)
):
    pedidos = get_pedidos_pagados(session, desde, hasta)
    pedido_ids = [p.id for p in pedidos]

    detalles = session.exec(
        select(DetallePedido).where(
            DetallePedido.pedido_id.in_(pedido_ids),
            DetallePedido.producto_id == producto_id,
        )
    ).all()

    producto = session.get(Producto, producto_id)
    total_cantidad = sum(d.cantidad for d in detalles)
    total_ventas   = sum(float(d.subtotal) for d in detalles)

    # Ventas por día
    por_dia = {}
    for d in detalles:
        pedido = session.get(Pedido, d.pedido_id)
        if pedido:
            dia = str(pedido.fecha)
            por_dia[dia] = por_dia.get(dia, 0) + d.cantidad

    return {
        "producto":        producto.nombre if producto else f"Producto {producto_id}",
        "total_cantidad":  total_cantidad,
        "total_ventas":    round(total_ventas, 2),
        "por_dia":         [{"fecha": k, "cantidad": v} for k, v in sorted(por_dia.items())],
    }


@router.get("/comparar")
def comparar_periodos(
    desde1: date,
    hasta1: date,
    desde2: date,
    hasta2: date,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user)
):
    pedidos1 = get_pedidos_pagados(session, desde1, hasta1)
    pedidos2 = get_pedidos_pagados(session, desde2, hasta2)

    reporte1 = calcular_reporte(pedidos1, session)
    reporte2 = calcular_reporte(pedidos2, session)

    return {
        "periodo1": {
            "desde": str(desde1),
            "hasta": str(hasta1),
            **reporte1,
        },
        "periodo2": {
            "desde": str(desde2),
            "hasta": str(hasta2),
            **reporte2,
        },
    }