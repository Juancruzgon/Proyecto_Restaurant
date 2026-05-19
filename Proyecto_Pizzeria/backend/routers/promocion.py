from fastapi import APIRouter, Depends
from sqlmodel import Session
from core.database import get_session
from models.usuario import Usuario
from schemas.promocion import PromocionCreate, PromocionModify, PromocionProductoCreate
from crud import promocion
from core.auth import get_current_user

router = APIRouter(
    prefix="/promociones",
    tags=["promociones"]
)

@router.get("/")
def obtener_promociones(session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    return promocion.obtener_promociones(session)

@router.post("/")
def crear_promocion(promocion: PromocionCreate, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    return promocion.crear_promocion(promocion, session)

@router.put("/{promocion_id}")
def modificar_promocion(promocion_id: int, promocion: PromocionModify, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    return promocion.modificar_promocion(promocion_id, promocion, session)

@router.delete("/{promocion_id}")
def eliminar_promocion(promocion_id: int, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    return promocion.eliminar_promocion(promocion_id, session)

@router.post("/{promocion_id}/productos")
def agregar_producto_promocion(promocion_id: int, detalle: PromocionProductoCreate, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    return promocion.agregar_producto_promocion(promocion_id, detalle, session)

@router.get("/{promocion_id}/productos")
def obtener_productos_promocion(promocion_id: int, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    return promocion.obtener_productos_promocion(promocion_id, session)