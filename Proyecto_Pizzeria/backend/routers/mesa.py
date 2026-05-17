from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from backend.core.database import get_session
from models.usuario import Usuario
from models.mesa import Mesa
from schemas.mesa import MesaCreate, MesaModify, MesaPosicion
from crud import mesa as mesa_crud
from backend.core.auth import get_current_user
from backend.core.websocket_manager import manager
import json

router = APIRouter(
    prefix="/mesas",
    tags=["mesas"]
)

@router.get("/")
def obtener_mesas(salon_id: int = None, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    return mesa_crud.obtener_mesas(session, salon_id)

@router.get("/{mesa_id}")
def obtener_mesa(mesa_id: int, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    mesa = session.get(Mesa, mesa_id)
    if not mesa:
        raise HTTPException(status_code=404, detail="Mesa no encontrada")
    return mesa

@router.post("/")
async def crear_mesa(mesa: MesaCreate, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    resultado = mesa_crud.crear_mesa(mesa, session)
    await manager.broadcast(json.dumps({"evento": "nueva_mesa", "mesa_id": resultado.id}))
    return resultado

@router.put("/{mesa_id}")
def modificar_mesa(mesa_id: int, mesa: MesaModify, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    return mesa_crud.modificar_mesa(mesa_id, mesa, session)

@router.put("/{mesa_id}/posicion")
async def actualizar_posicion(mesa_id: int, posicion: MesaPosicion, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    mesa = session.get(Mesa, mesa_id)
    if not mesa:
        raise HTTPException(status_code=404, detail="Mesa no encontrada")
    mesa.pos_x = posicion.pos_x
    mesa.pos_y = posicion.pos_y
    session.add(mesa)
    session.commit()
    session.refresh(mesa)
    await manager.broadcast(json.dumps({
        "evento": "mesa_movida",
        "mesa_id": mesa_id,
        "pos_x": posicion.pos_x,
        "pos_y": posicion.pos_y,
    }))
    return mesa

@router.delete("/{mesa_id}")
def eliminar_mesa(mesa_id: int, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    return mesa_crud.eliminar_mesa(mesa_id, session)