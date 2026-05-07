from datetime import date
from sqlmodel import Session, select, col
from models.producto import Producto
import schemas
from fastapi import HTTPException
from auth import hashear_password


def obtener_productos(session: Session, categoria_id: int = None):
    statement = select(Producto).where(Producto.activo == True)
    if categoria_id:
        statement = statement.where(Producto.categoria_id == categoria_id)
    resultados = session.exec(statement)
    return resultados.all()

def crear_producto(producto: schemas.ProductoCreate, session: Session):
    nuevo_producto = Producto(**producto.model_dump())
    session.add(nuevo_producto)
    session.commit()
    session.refresh(nuevo_producto)
    return nuevo_producto

def modificar_producto(producto_id: int, producto: schemas.ProductoModify, session: Session):
    producto_existente = session.exec(select(Producto).where(Producto.id == producto_id)).first()
    if not producto_existente:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    for attr, value in producto.model_dump(exclude_unset=True).items():
        setattr(producto_existente, attr, value)
    session.add(producto_existente)
    session.commit()
    session.refresh(producto_existente)
    return producto_existente

def eliminar_producto(producto_id: int, session: Session):
    producto_existente = session.exec(select(Producto).where(Producto.id == producto_id)).first()
    if not producto_existente:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    producto_existente.activo = False
    session.commit()
    return {"detail": "Producto eliminado"}