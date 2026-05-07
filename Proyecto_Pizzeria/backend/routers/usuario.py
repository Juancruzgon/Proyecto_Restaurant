from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from database import get_session
from models.usuario import Usuario
from schemas.usuario import UsuarioCreate, UsuarioModify
from crud import usuario
from auth import get_current_user

router = APIRouter(
    prefix="/usuarios",
    tags=["usuarios"]
)

@router.post("/")
def crear_usuario(usuario: UsuarioCreate, session: Session = Depends(get_session)):
    return usuario.crear_usuario(usuario, session)

@router.get("/")
def obtener_usuarios(session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    return usuario.obtener_usuarios(session)

@router.put("/{usuario_id}")
def modificar_usuario(usuario_id: int, usuario: UsuarioModify, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    return usuario.modificar_usuario(usuario_id, usuario, session)

@router.delete("/{usuario_id}")
def eliminar_usuario(usuario_id: int, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    return usuario.eliminar_usuario(usuario_id, session)