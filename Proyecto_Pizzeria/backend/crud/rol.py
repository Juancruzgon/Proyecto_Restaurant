from datetime import date
from sqlmodel import Session, select, col
from models.rol import Rol
import schemas
from fastapi import HTTPException
from backend.core.auth import hashear_password

def obtener_roles(session: Session):
    statement = select(Rol)
    resultados = session.exec(statement)
    return resultados.all()

def crear_rol(rol: schemas.RolCreate, session: Session):
    nuevo_rol = Rol(**rol.model_dump())
    session.add(nuevo_rol)
    session.commit()
    session.refresh(nuevo_rol)
    return nuevo_rol

def modificar_rol(rol_id: int, rol: schemas.RolModify, session: Session):
    rol_existente = session.exec(select(Rol).where(Rol.id == rol_id)).first()
    if not rol_existente:
        raise HTTPException(status_code=404, detail="Rol no encontrado")
    for attr, value in rol.model_dump(exclude_unset=True).items():
        setattr(rol_existente, attr, value)
    session.add(rol_existente)
    session.commit()
    session.refresh(rol_existente)
    return rol_existente

def eliminar_rol(rol_id: int, session: Session):
    rol_existente = session.exec(select(Rol).where(Rol.id == rol_id)).first()
    if not rol_existente:
        raise HTTPException(status_code=404, detail="Rol no encontrado")
    session.delete(rol_existente)
    session.commit()
    return {"detail": "Rol eliminado"}