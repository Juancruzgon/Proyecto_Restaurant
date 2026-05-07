from datetime import date
from sqlmodel import Session, select, col
from models.categoria_producto import CategoriaProducto
import schemas
from fastapi import HTTPException

def obtener_categoria_productos(session: Session):
    statement = select(CategoriaProducto)
    resultados = session.exec(statement)
    return resultados.all()

def crear_categoria_producto(categoria: schemas.CategoriaProductoCreate, session: Session):
    nueva_categoria = CategoriaProducto(**categoria.model_dump())
    session.add(nueva_categoria)
    session.commit()
    session.refresh(nueva_categoria)
    return nueva_categoria

def modificar_categoria_producto(categoria_id: int, categoria: schemas.CategoriaProductoModify, session: Session):
    categoria_existente = session.exec(select(CategoriaProducto).where(CategoriaProducto.id == categoria_id)).first()
    if not categoria_existente:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    for attr, value in categoria.model_dump(exclude_unset=True).items():
        setattr(categoria_existente, attr, value)
    session.add(categoria_existente)
    session.commit()
    session.refresh(categoria_existente)
    return categoria_existente

def eliminar_categoria_producto(categoria_id: int, session: Session):
    categoria_existente = session.exec(select(CategoriaProducto).where(CategoriaProducto.id == categoria_id)).first()
    if not categoria_existente:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    session.delete(categoria_existente)
    session.commit()
    return {"detail": "Categoría eliminada"}

def obtener_categorias_por_nivel(session: Session, parent_id: int = None):
    if parent_id is None:
        statement = select(CategoriaProducto).where(CategoriaProducto.parent_id == None)
    else:
        statement = select(CategoriaProducto).where(CategoriaProducto.parent_id == parent_id)
    return session.exec(statement).all()