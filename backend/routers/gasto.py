from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from core.database import get_session
from models.usuario import Usuario
from schemas.gasto import GastoCreate, GastoModify
from crud import gasto as gasto_crud
from core.auth import get_current_user

router = APIRouter(
    prefix="/gastos",
    tags=["gastos"]
)

@router.get("/")
def obtener_gastos(categoria_id: int = None, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    return gasto_crud.obtener_gastos(session, categoria_id)

@router.post("/")
def crear_gasto(gasto: GastoCreate, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    return gasto_crud.crear_gasto(gasto, session)

@router.put("/{gasto_id}")
def modificar_gasto(gasto_id: int, gasto: GastoModify, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    return gasto_crud.modificar_gasto(gasto_id, gasto, session)

@router.delete("/{gasto_id}")
def eliminar_gasto(gasto_id: int, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    return gasto_crud.eliminar_gasto(gasto_id, session)