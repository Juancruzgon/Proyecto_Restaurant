from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from core.database import get_session
from models.usuario import Usuario
from schemas.rol import RolCreate, RolModify
from crud import rol
from core.auth import get_current_user

router = APIRouter(
    prefix="/roles",
    tags=["roles"],
)

@router.post("/")
def crear_rol(rol: RolCreate, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    return rol.crear_rol(rol, session)

@router.get("/")
def obtener_roles(session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    return rol.obtener_roles(session)

@router.put("/{rol_id}")
def modificar_rol(rol_id: int, rol: RolModify, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    return rol.modificar_rol(rol_id, rol, session)

@router.delete("/{rol_id}")
def eliminar_rol(rol_id: int, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    return rol.eliminar_rol(rol_id, session)