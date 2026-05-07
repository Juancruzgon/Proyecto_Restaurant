from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from database import get_session
from models.usuario import Usuario
from schemas.gasto import GastoCreate, GastoModify
from crud import gasto
from auth import get_current_user

router = APIRouter(
    prefix="/gastos",
    tags=["gastos"]
)

@router.get("/")
def obtener_gastos(session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    return gasto.obtener_gastos(session)

@router.post("/")
def crear_gasto(gasto: GastoCreate, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    return gasto.crear_gasto(gasto, session)

@router.put("/{gasto_id}")
def modificar_gasto(gasto_id: int, gasto: GastoModify, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    return gasto.modificar_gasto(gasto_id, gasto, session)

@router.delete("/{gasto_id}")
def eliminar_gasto(gasto_id: int, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    return gasto.eliminar_gasto(gasto_id, session)