from datetime import date
from sqlmodel import Session, select, col
from models.salon import Salon
from schemas.salon import SalonCreate, SalonModify
from fastapi import HTTPException

def obtener_salon(session: Session):
    return session.exec(select(Salon)).all()

def crear_salon(salon: SalonCreate, session: Session):
    nuevo_salon = Salon(**salon.model_dump())
    session.add(nuevo_salon)
    session.commit()
    session.refresh(nuevo_salon)
    return nuevo_salon

def modificar_salon(salon_id: int, salon: SalonModify, session: Session):
    salon_existente = session.exec(select(Salon).where(Salon.id == salon_id)).first()
    if not salon_existente:
        raise HTTPException(status_code=404, detail="Salón no encontrado")
    for attr, value in salon.model_dump(exclude_unset=True).items():
        setattr(salon_existente, attr, value)
    session.add(salon_existente)
    session.commit()
    session.refresh(salon_existente)
    return salon_existente

def eliminar_salon(salon_id: int, session: Session):
    salon_existente = session.exec(select(Salon).where(Salon.id == salon_id)).first()
    if not salon_existente:
        raise HTTPException(status_code=404, detail="Salón no encontrado")
    session.delete(salon_existente)
    session.commit()
    return {"detail": "Salón eliminado"}