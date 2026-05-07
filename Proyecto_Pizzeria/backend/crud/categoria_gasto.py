from datetime import date
from sqlmodel import Session, select, col
from models.categoria_gasto import CategoriaGasto
import schemas
from fastapi import HTTPException

def obtener_categoria_gastos(session: Session):
    statement = select(CategoriaGasto)
    resultados = session.exec(statement)
    return resultados.all()

def crear_categoria_gasto(categoria: schemas.CategoriaGastoCreate, session: Session):
    nueva_categoria = CategoriaGasto(**categoria.model_dump())
    session.add(nueva_categoria)
    session.commit()
    session.refresh(nueva_categoria)
    return nueva_categoria

def modificar_categoria_gasto(categoria_id: int, categoria: schemas.CategoriaGastoModify, session: Session):
    categoria_existente = session.exec(select(CategoriaGasto).where(CategoriaGasto.id == categoria_id)).first()
    if not categoria_existente:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    for attr, value in categoria.model_dump(exclude_unset=True).items():
        setattr(categoria_existente, attr, value)
    session.add(categoria_existente)
    session.commit()
    session.refresh(categoria_existente)
    return categoria_existente

def eliminar_categoria_gasto(categoria_id: int, session: Session):
    categoria_existente = session.exec(select(CategoriaGasto).where(CategoriaGasto.id == categoria_id)).first()
    if not categoria_existente:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    session.delete(categoria_existente)
    session.commit()
    return {"detail": "Categoría eliminada"}