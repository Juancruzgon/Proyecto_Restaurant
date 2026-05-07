from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from database import get_session
from models.usuario import Usuario
from models.mesa import Mesa
from schemas.mesa import MesaCreate, MesaModify
from crud import mesa
from auth import get_current_user
from websocket_manager import manager
import json

router = APIRouter(
    prefix="/mesas",
    tags=["mesas"]
)

@router.get("/")
def obtener_mesas(salon_id: int = None, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    return mesa.obtener_mesas(session, salon_id)

@router.get("/{mesa_id}")
def obtener_mesa(mesa_id: int, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    mesa = session.get(Mesa, mesa_id)
    if not mesa:
        raise HTTPException(status_code=404, detail="Mesa no encontrada")
    return mesa

@router.post("/")
async def crear_mesa(mesa: MesaCreate, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    resultado = mesa.crear_mesa(mesa, session)
    await manager.broadcast(json.dumps({"evento": "nueva_mesa", "mesa_id": resultado.id}))
    return resultado

@router.put("/{mesa_id}")
def modificar_mesa(mesa_id: int, mesa: MesaModify, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    return mesa.modificar_mesa(mesa_id, mesa, session)

@router.delete("/{mesa_id}")
def eliminar_mesa(mesa_id: int, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    return mesa.eliminar_mesa(mesa_id, session)