from datetime import date
from sqlmodel import Session, select, col
from models.promocion import Promocion, PromocionProducto
import schemas
from fastapi import HTTPException

def obtener_promociones(session: Session):
    return session.exec(select(Promocion).where(Promocion.activo == True)).all()

def crear_promocion(promocion: schemas.PromocionCreate, session: Session):
    nueva = Promocion(**promocion.model_dump())
    session.add(nueva)
    session.commit()
    session.refresh(nueva)
    return nueva

def modificar_promocion(promocion_id: int, promocion: schemas.PromocionModify, session: Session):
    existente = session.exec(select(Promocion).where(Promocion.id == promocion_id)).first()
    if not existente:
        raise HTTPException(status_code=404, detail="Promoción no encontrada")
    for attr, value in promocion.model_dump(exclude_unset=True).items():
        setattr(existente, attr, value)
    session.add(existente)
    session.commit()
    session.refresh(existente)
    return existente

def eliminar_promocion(promocion_id: int, session: Session):
    existente = session.exec(select(Promocion).where(Promocion.id == promocion_id)).first()
    if not existente:
        raise HTTPException(status_code=404, detail="Promoción no encontrada")
    existente.activo = False
    session.commit()
    return {"detail": "Promoción eliminada"}

def agregar_producto_promocion(promocion_id: int, detalle: schemas.PromocionProductoCreate, session: Session):
    nuevo = PromocionProducto(promocion_id=promocion_id, **detalle.model_dump())
    session.add(nuevo)
    session.commit()
    session.refresh(nuevo)
    return nuevo

def obtener_productos_promocion(promocion_id: int, session: Session):
    return session.exec(select(PromocionProducto).where(PromocionProducto.promocion_id == promocion_id)).all()