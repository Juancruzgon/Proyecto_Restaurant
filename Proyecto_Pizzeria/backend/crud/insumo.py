from datetime import date
from sqlmodel import Session, select, col
from models.insumo import Insumo, MovimientoStock
import schemas
from fastapi import HTTPException

def obtener_insumos(session: Session, categoria_id: int = None):
    statement = select(Insumo)
    if categoria_id:
        statement = statement.where(Insumo.categoria_id == categoria_id)
    resultados = session.exec(statement)
    return resultados.all()

def crear_insumo(insumo: schemas.InsumoCreate, session: Session):
    nuevo_insumo = Insumo(**insumo.model_dump())
    session.add(nuevo_insumo)
    session.commit()
    session.refresh(nuevo_insumo)
    return nuevo_insumo

def modificar_insumo(insumo_id: int, insumo: schemas.InsumoModify, session: Session):
    insumo_existente = session.exec(select(Insumo).where(Insumo.id == insumo_id)).first()
    if not insumo_existente:
        raise HTTPException(status_code=404, detail="Insumo no encontrado")
    for attr, value in insumo.model_dump(exclude_unset=True).items():
        setattr(insumo_existente, attr, value)
    session.add(insumo_existente)
    session.commit()
    session.refresh(insumo_existente)
    return insumo_existente

def eliminar_insumo(insumo_id: int, session: Session):
    insumo_existente = session.exec(select(Insumo).where(Insumo.id == insumo_id)).first()
    if not insumo_existente:
        raise HTTPException(status_code=404, detail="Insumo no encontrado")
    session.delete(insumo_existente)
    session.commit()
    return {"detail": "Insumo eliminado"}

def agregar_compra(insumo_id: int, cantidad: int, session: Session):
    insumo_existente = session.exec(select(Insumo).where(Insumo.id == insumo_id)).first()
    if not insumo_existente:
        raise HTTPException(status_code=404, detail="Insumo no encontrado")
    insumo_existente.stock_actual += cantidad
    movimiento = MovimientoStock(
        nro_id=insumo_id,
        id_insumo=insumo_id,
        cantidad=cantidad,
    )
    session.add(movimiento)
    session.add(insumo_existente)
    session.commit()
    session.refresh(insumo_existente)
    return insumo_existente