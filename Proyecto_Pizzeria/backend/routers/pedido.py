import os
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database import get_session
from models.usuario import Usuario
from models.caja import Caja
from schemas.pedido import PedidoCreate, PedidoModify, DetallePedidoCreate, DetallePedidoModifyNota
from schemas.pago import CobrarPedidoRequest
from crud.pedido import (
    obtener_pedidos as crud_obtener_pedidos,
    crear_pedido as crud_crear_pedido,
    modificar_pedido as crud_modificar_pedido,
    eliminar_pedido as crud_eliminar_pedido,
    cambiar_estado_pedido as crud_cambiar_estado_pedido,
    cobrar_pedido as crud_cobrar_pedido,
    detalle_pedido as crud_detalle_pedido,
    mostrar_detalle_pedido as crud_mostrar_detalle_pedido,
    eliminar_producto_pedido as crud_eliminar_producto_pedido,
    modificar_cantidad_pedido as crud_modificar_cantidad_pedido,
    modificar_nota_detalle as crud_modificar_nota_detalle,
)
from models.pedido import Pedido
from auth import get_current_user
from websocket_manager import manager
from prynter import imprimir_comanda, imprimir_ticket
import json
import threading

router = APIRouter(
    prefix="/pedidos",
    tags=["pedidos"]
)

@router.get("/")
def obtener_pedidos(
    mesa_id: int = None,
    caja_id: int = None,
    pagados: bool = False,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user)
):
    return crud_obtener_pedidos(session, mesa_id=mesa_id, caja_id=caja_id, pagados=pagados)


@router.get("/{pedido_id}")
def obtener_pedido(pedido_id: int, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    pedido = session.get(Pedido, pedido_id)
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    return pedido


@router.post("/")
async def crear_pedido(pedido: PedidoCreate, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    resultado = crud_crear_pedido(pedido, session)
    await manager.broadcast(json.dumps({
        "evento": "nuevo_pedido",
        "pedido_id": resultado.id,
        "mesa_id": resultado.mesa_id
    }))
    return resultado

@router.put("/{pedido_id}")
def modificar_pedido(pedido_id: int, pedido: PedidoModify, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    return crud_modificar_pedido(pedido_id, pedido, session)

@router.delete("/{pedido_id}")
async def eliminar_pedido(pedido_id: int, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    resultado = crud_eliminar_pedido(pedido_id, session)
    await manager.broadcast(json.dumps({"evento": "eliminar_pedido", "pedido_id": pedido_id, "mesa_id": resultado.mesa_id}))
    return resultado

@router.put("/{pedido_id}/estado")
async def cambiar_estado_pedido(pedido_id: int, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    resultado = crud_cambiar_estado_pedido(pedido_id, session)
    await manager.broadcast(json.dumps({"evento": "estado_pedido", "pedido_id": pedido_id, "estado_id": resultado.estado_id}))
    return resultado

@router.put("/{pedido_id}/cobrar")
async def cobrar_pedido(
    pedido_id: int,
    data: CobrarPedidoRequest,
    session: Session = Depends(get_session),
    current_user: Usuario = Depends(get_current_user)
):
    resultado = crud_cobrar_pedido(pedido_id, data.pagos, session)
    await manager.broadcast(json.dumps({"evento": "estado_pedido", "pedido_id": pedido_id, "estado_id": 4}))
    detalles = crud_mostrar_detalle_pedido(pedido_id, session)
    ip     = os.getenv("TICKET_PRINTER_IP")
    puerto = int(os.getenv("TICKET_PRINTER_PORT", 9100))
    if ip:
        threading.Thread(target=imprimir_ticket, args=(resultado, detalles, ip, puerto)).start()
    return resultado

@router.post("/{pedido_id}/detalle")
async def agregar_detalle_pedido(pedido_id: int, detalle: DetallePedidoCreate, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    resultado = crud_detalle_pedido(pedido_id, detalle, session)
    await manager.broadcast(json.dumps({"evento": "detalle_agregado", "pedido_id": pedido_id, "producto_id": detalle.producto_id, "cantidad": detalle.cantidad}))
    return resultado

@router.get("/{pedido_id}/detalle")
def mostrar_detalle_pedido(pedido_id: int, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    return crud_mostrar_detalle_pedido(pedido_id, session)

@router.delete("/{pedido_id}/detalle/{detalle_id}")
async def eliminar_producto_pedido(pedido_id: int, detalle_id: int, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    resultado = crud_eliminar_producto_pedido(detalle_id, session)
    await manager.broadcast(json.dumps({"evento": "Producto_eliminado", "pedido_id": pedido_id, "detalle_id": detalle_id}))
    return resultado

@router.put("/{pedido_id}/detalle/{detalle_id}")
async def modificar_cantidad_pedido(pedido_id: int, detalle_id: int, cantidad: int, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    resultado = crud_modificar_cantidad_pedido(detalle_id, cantidad, session)
    await manager.broadcast(json.dumps({"evento": "Producto_modificado", "pedido_id": pedido_id, "detalle_id": detalle_id, "nueva_cantidad": cantidad}))
    return resultado

@router.put("/{pedido_id}/detalle/{detalle_id}/nota")
def modificar_nota_detalle(pedido_id: int, detalle_id: int, data: DetallePedidoModifyNota, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    return crud_modificar_nota_detalle(detalle_id, data.nota, session)

@router.post("/{pedido_id}/imprimir-comanda")
def imprimir_comanda_pedido(pedido_id: int, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    pedido = session.get(Pedido, pedido_id)
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    detalles = crud_mostrar_detalle_pedido(pedido_id, session)
    ip     = os.getenv("PRINTER_IP")
    puerto = int(os.getenv("PRINTER_PORT", 9100))
    if not ip:
        raise HTTPException(status_code=500, detail="PRINTER_IP no configurada")
    if detalles:
        pedido.ultimo_detalle_impreso = max(d["id"] for d in detalles)
        session.add(pedido)
        session.commit()
    threading.Thread(target=imprimir_comanda, args=(pedido, detalles, ip, puerto)).start()
    return {"detail": "Comanda enviada a imprimir"}


@router.post("/{pedido_id}/imprimir-nuevos")
def imprimir_nuevos_productos(pedido_id: int, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    pedido = session.get(Pedido, pedido_id)
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    ip     = os.getenv("PRINTER_IP")
    puerto = int(os.getenv("PRINTER_PORT", 9100))
    if not ip:
        raise HTTPException(status_code=500, detail="PRINTER_IP no configurada")
    todos = crud_mostrar_detalle_pedido(pedido_id, session)
    nuevos = [d for d in todos if d["id"] > (pedido.ultimo_detalle_impreso or 0)]
    if not nuevos:
        return {"detail": "No hay productos nuevos para imprimir"}
    pedido.ultimo_detalle_impreso = max(d["id"] for d in nuevos)
    session.add(pedido)
    session.commit()
    threading.Thread(target=imprimir_comanda, args=(pedido, nuevos, ip, puerto)).start()
    return {"detail": "Nuevos productos enviados a imprimir"}

@router.post("/{pedido_id}/imprimir-ticket")
def imprimir_ticket_pedido(pedido_id: int, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    pedido = session.get(Pedido, pedido_id)
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    detalles = crud_mostrar_detalle_pedido(pedido_id, session)
    ip     = os.getenv("TICKET_PRINTER_IP")
    puerto = int(os.getenv("TICKET_PRINTER_PORT", 9100))
    if not ip:
        raise HTTPException(status_code=500, detail="TICKET_PRINTER_IP no configurada")
    threading.Thread(target=imprimir_ticket, args=(pedido, detalles, ip, puerto)).start()
    return {"detail": "Ticket enviado a imprimir"}