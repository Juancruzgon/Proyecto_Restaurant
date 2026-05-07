from datetime import date
from sqlmodel import Session, select, col
from models.gasto import Gasto

def obtener_gastos(session: Session):
    statement = select(Gasto)
    resultados = session.exec(statement)
    return resultados.all()

def crear_gasto(gasto: schemas.GastoCreate, session: Session):
    nuevo_gasto = Gasto(**gasto.model_dump())
    session.add(nuevo_gasto)
    session.commit()
    session.refresh(nuevo_gasto)
    return nuevo_gasto

def modificar_gasto(gasto_id: int, gasto: schemas.GastoModify, session: Session):
    gasto_existente = session.exec(select(Gasto).where(Gasto.id == gasto_id)).first()
    if not gasto_existente:
        raise HTTPException(status_code=404, detail="Gasto no encontrado")
    for attr, value in gasto.model_dump(exclude_unset=True).items():
        setattr(gasto_existente, attr, value)
    session.add(gasto_existente)
    session.commit()
    session.refresh(gasto_existente)
    return gasto_existente

def eliminar_gasto(gasto_id: int, session: Session):
    gasto_existente = session.exec(select(Gasto).where(Gasto.id == gasto_id)).first()
    if not gasto_existente:
        raise HTTPException(status_code=404, detail="Gasto no encontrado")
    session.delete(gasto_existente)
    session.commit()
    return {"detail": "Gasto eliminado"}
