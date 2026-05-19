# routers/reporte.py
from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from sqlalchemy import func
from core.database import get_session
from models.usuario import Usuario
from models.pedido import Pedido, DetallePedido
from models.producto import Producto
from models.categoria_producto import CategoriaProducto
from models.caja import Caja
from models.pago import Pago
from core.auth import get_current_user
from datetime import date
from decimal import Decimal

router = APIRouter(
    prefix="/reportes",
    tags=["reportes"]
)

def get_pedidos_pagados(session: Session, desde: date, hasta: date, caja_id: int = None):
    statement = select(Pedido).where(
        Pedido.estado_id == 4,
        Pedido.fecha >= desde,
        Pedido.fecha <= hasta,
    )
    if caja_id:
        statement = statement.where(Pedido.caja_id == caja_id)
    return session.exec(statement).all()

def calcular_reporte(pedidos: list, session: Session):
    if not pedidos:
        return {
            "total_ventas": 0,
            "total_pedidos": 0,
            "ticket_promedio": 0,
            "por_hora": [],
            "por_categoria": [],
            "productos_top": [],
            "pedidos": [],
            "por_metodo": {},
        }

    total_ventas    = sum(float(p.total) for p in pedidos)
    total_pedidos   = len(pedidos)
    ticket_promedio = total_ventas / total_pedidos if total_pedidos else 0

    # Ventas por hora (Modificado para contar pedidos y armar las 24hs)
    por_hora_dict = {h: {"ventas": 0, "pedidos": 0} for h in range(24)}
    for p in pedidos:
        h = p.hora.hour if p.hora else 0
        por_hora_dict[h]["ventas"] += float(p.total)
        por_hora_dict[h]["pedidos"] += 1
    
    por_hora_lista = [
        {
            "hora": f"{h:02d}:00", 
            "ventas": round(datos["ventas"], 2), 
            "pedidos": datos["pedidos"]
        } 
        for h, datos in sorted(por_hora_dict.items())
    ]

    # Detalles
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

    # Desglose por método de pago
    pagos = session.exec(
        select(Pago).where(Pago.pedido_id.in_(pedido_ids))
    ).all()
    por_metodo = {}
    for pago in pagos:
        por_metodo[pago.metodo] = round(por_metodo.get(pago.metodo, 0) + float(pago.monto), 2)

    # Listado de pedidos
    pedidos_lista = []
    for p in sorted(pedidos, key=lambda x: (x.fecha, x.hora), reverse=True):
        metodo = p.metodo_pago or "—"
        pedidos_lista.append({
            "id":          p.id,
            "nro_pedido":  p.nro_pedido,
            "fecha":       str(p.fecha),
            "hora":        str(p.hora)[:5] if p.hora else "—",
            "tipo_pedido": p.tipo_pedido,
            "mesa_id":     p.mesa_id,
            "total":       float(p.total),
            "metodo_pago": metodo,
        })

    return {
        "total_ventas":    round(total_ventas, 2),
        "total_pedidos":   total_pedidos,
        "ticket_promedio": round(ticket_promedio, 2),
        "por_hora":        por_hora_lista,
        "por_categoria":   por_categoria,
        "productos_top":   productos_top,
        "pedidos":         pedidos_lista,
        "por_metodo":      por_metodo,
    }


@router.get("/ventas")
def reporte_ventas(
    desde: date,
    hasta: date,
    caja_id: int = None,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user)
):
    pedidos = get_pedidos_pagados(session, desde, hasta, caja_id)
    return calcular_reporte(pedidos, session)


@router.get("/cajas")
def historial_cajas(
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user)
):
    cajas = session.exec(select(Caja).order_by(Caja.fecha_apertura.desc())).all()
    resultado = []
    for c in cajas:
        usuario = session.get(Usuario, c.usuario_id)
        resultado.append({
            "id":             c.id,
            "usuario":        f"{usuario.nombre} {usuario.apellido}" if usuario else "—",
            "fecha_apertura": str(c.fecha_apertura),
            "fecha_cierre":   str(c.fecha_cierre) if c.fecha_cierre else None,
            "total_ventas":   float(c.total_ventas),
            "total_pedidos":  c.total_pedidos,
            "activo":         c.activo,
        })
    return resultado


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

    producto       = session.get(Producto, producto_id)
    total_cantidad = sum(d.cantidad for d in detalles)
    total_ventas   = sum(float(d.subtotal) for d in detalles)

    por_dia = {}
    for d in detalles:
        pedido = session.get(Pedido, d.pedido_id)
        if pedido:
            dia = str(pedido.fecha)
            por_dia[dia] = por_dia.get(dia, 0) + d.cantidad

    return {
        "producto":       producto.nombre if producto else f"Producto {producto_id}",
        "total_cantidad": total_cantidad,
        "total_ventas":   round(total_ventas, 2),
        "por_dia":        [{"fecha": k, "cantidad": v} for k, v in sorted(por_dia.items())],
    }


@router.get("/cajas-por-fecha")
def cajas_por_fecha(
    fecha: date,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user)
):
    cajas = session.exec(
        select(Caja).where(func.date(Caja.fecha_apertura) == fecha)
    ).all()
    resultado = []
    for c in cajas:
        resultado.append({
            "id":             c.id,
            "fecha_apertura": str(c.fecha_apertura),
            "fecha_cierre":   str(c.fecha_cierre) if c.fecha_cierre else None,
            "activo":         c.activo,
        })
    return resultado


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
        "periodo1": {"desde": str(desde1), "hasta": str(hasta1), **reporte1},
        "periodo2": {"desde": str(desde2), "hasta": str(hasta2), **reporte2},
    }