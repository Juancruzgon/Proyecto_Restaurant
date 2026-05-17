from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from backend.core.database import get_session
from models.usuario import Usuario
from schemas.salon import SalonCreate, SalonModify
import crud.salon
from backend.core.auth import get_current_user

router = APIRouter(
    prefix="/salones",
    tags=["salones"],
)

@router.post("/")
def crear_salon(salon: SalonCreate, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    return salon.crear_salon(salon, session)

@router.get("/")
def obtener_salon(session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    return crud.salon.obtener_salon(session)

@router.put("/{salon_id}")
def modificar_salon(salon_id: int, salon: SalonModify, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    return crud.salon.modificar_salon(salon_id, salon, session)

@router.delete("/{salon_id}")
def eliminar_salon(salon_id: int, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    return crud.salon.eliminar_salon(salon_id, session)