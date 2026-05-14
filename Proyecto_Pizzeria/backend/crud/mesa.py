from datetime import date
from sqlmodel import Session, select, col
from models.mesa import Mesa
from models.estado import EstadoMesa
import schemas
from fastapi import HTTPException


def obtener_mesas(session: Session, salon_id: int = None):
    statement = select(Mesa).where(col(Mesa.activo) == True)
    if salon_id:
        statement = statement.where(col(Mesa.salon_id) == salon_id)
    return session.exec(statement).all()

def crear_mesa(mesa: schemas.MesaCreate, session: Session):
    nueva_mesa = Mesa(**mesa.model_dump(), estado_id=1)  # Asignar estado "Disponible" por defecto
    session.add(nueva_mesa)
    session.commit()
    session.refresh(nueva_mesa)
    return nueva_mesa

def modificar_mesa(mesa_id: int, mesa: schemas.MesaModify, session: Session):
    mesa_existente = session.exec(select(Mesa).where(Mesa.id == mesa_id)).first()
    if not mesa_existente:
        raise HTTPException(status_code=404, detail="Mesa no encontrada")
    for attr, value in mesa.model_dump(exclude_unset=True).items():
        setattr(mesa_existente, attr, value)
    session.add(mesa_existente)
    session.commit()
    session.refresh(mesa_existente)
    return mesa_existente

def eliminar_mesa(mesa_id: int, session: Session):
    mesa_existente = session.exec(select(Mesa).where(Mesa.id == mesa_id)).first()
    if not mesa_existente:
        raise HTTPException(status_code=404, detail="Mesa no encontrada")
    session.delete(mesa_existente)
    session.commit()
    return {"detail": "Mesa eliminada"}