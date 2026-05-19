from datetime import date
from sqlmodel import Session, select, col
from models.usuario import Usuario
import schemas.usuario as schemas
from fastapi import HTTPException
from core.auth import hashear_password

def obtener_usuarios(session: Session):
    statement = select(Usuario)
    resultados = session.exec(statement)
    return resultados.all()

def obtener_usuario(usuario_id: int, session: Session):
    usuario = session.get(Usuario, usuario_id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario

def crear_usuario(usuario: schemas.UsuarioCreate, session: Session):
    nuevo_usuario = Usuario(**usuario.model_dump(exclude={"password"}), password=hashear_password(usuario.password))
    session.add(nuevo_usuario)
    session.commit()
    session.refresh(nuevo_usuario)
    return nuevo_usuario


def modificar_usuario(usuario_id: int, usuario: schemas.UsuarioModify, session: Session):
    usuario_existente = session.exec(select(Usuario).where(Usuario.id == usuario_id)).first()
    if not usuario_existente:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    datos = usuario.model_dump(exclude_unset=True)
    if 'password' in datos:
        datos['password'] = hashear_password(datos['password'])
    
    for attr, value in datos.items():
        setattr(usuario_existente, attr, value)
    
    session.add(usuario_existente)
    session.commit()
    session.refresh(usuario_existente)
    return usuario_existente

def eliminar_usuario(usuario_id: int, session: Session):
    usuario_existente = session.exec(select(Usuario).where(Usuario.id == usuario_id)).first()
    if not usuario_existente:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    usuario_existente.activo = False
    session.commit()
    return {"detail": "Usuario eliminado"}