from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from core.database import get_session
from models.usuario import Usuario
from models.producto import Producto
from schemas.producto import ProductoCreate, ProductoModify
from crud import producto as producto_crud
from core.auth import get_current_user

router = APIRouter(
    prefix="/productos",
    tags=["productos"]
)
@router.get("/")
def obtener_productos(categoria_id: int = None, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    return producto_crud.obtener_productos(session, categoria_id)

@router.get("/{producto_id}")
def obtener_producto(producto_id: int, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    producto = session.get(Producto, producto_id)
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return producto

@router.post("/")
def crear_producto(producto: ProductoCreate, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    return producto_crud.crear_producto(producto, session)

@router.put("/{producto_id}")
def modificar_producto(producto_id: int, producto: ProductoModify, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    return producto_crud.modificar_producto(producto_id, producto, session)

@router.delete("/{producto_id}")
def eliminar_producto(producto_id: int, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    return producto_crud.eliminar_producto(producto_id, session)

