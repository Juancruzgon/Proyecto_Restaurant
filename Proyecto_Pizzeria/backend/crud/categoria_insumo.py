from datetime import date
from sqlmodel import Session, select, col
from models.insumo import MovimientoStock
from models.categoria_insumo import CategoriaInsumo
from fastapi import HTTPException

def obtener_categorias_insumo(session: Session, parent_id: int = None):
    if parent_id is None:
        statement = select(CategoriaInsumo).where(CategoriaInsumo.parent_id == None)
    else:
        statement = select(CategoriaInsumo).where(CategoriaInsumo.parent_id == parent_id)
    return session.exec(statement).all()

def crear_categoria_insumo(categoria: schemas.CategoriaInsumoCreate, session: Session):
    nueva = CategoriaInsumo(**categoria.model_dump())
    session.add(nueva)
    session.commit()
    session.refresh(nueva)
    return nueva

def modificar_categoria_insumo(categoria_id: int, categoria: schemas.CategoriaInsumoModify, session: Session):
    existente = session.exec(select(CategoriaInsumo).where(CategoriaInsumo.id == categoria_id)).first()
    if not existente:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    for attr, value in categoria.model_dump(exclude_unset=True).items():
        setattr(existente, attr, value)
    session.add(existente)
    session.commit()
    session.refresh(existente)
    return existente

def eliminar_categoria_insumo(categoria_id: int, session: Session):
    existente = session.exec(select(CategoriaInsumo).where(CategoriaInsumo.id == categoria_id)).first()
    if not existente:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    session.delete(existente)
    session.commit()
    return {"detail": "Categoría eliminada"}

def agregar_compra(insumo_id: int, cantidad: int, session: Session):
    insumo = session.exec(select(Insumo).where(Insumo.id == insumo_id)).first()
    if not insumo:
        raise HTTPException(status_code=404, detail="Insumo no encontrado")
    insumo.stock_actual += cantidad
    movimiento = MovimientoStock(
        nro_id=insumo_id,
        id_insumo=insumo_id,
        cantidad=cantidad,
        tipo="entrada"
    )
    session.add(movimiento)
    session.add(insumo)
    session.commit()
    session.refresh(insumo)
    return insumo