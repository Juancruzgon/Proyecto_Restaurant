from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from database import get_session
from models.usuario import Usuario
from schemas.insumo import InsumoCreate, InsumoModify 
from crud import insumo as insumo_crud
from auth import get_current_user


router = APIRouter(
    prefix="/insumos",
    tags=["insumos"]
)

@router.post("/")
def crear_insumo(insumo: InsumoCreate, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    return insumo_crud.crear_insumo(insumo, session)

@router.put("/{insumo_id}")
def modificar_insumo(insumo_id: int, insumo: InsumoModify, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    return insumo_crud.modificar_insumo(insumo_id, insumo, session)

@router.delete("/{insumo_id}")
def eliminar_insumo(insumo_id: int, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    return insumo_crud.eliminar_insumo(insumo_id, session)

@router.get("/")
def obtener_insumos(categoria_id: int = None, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    return insumo_crud.obtener_insumos(session, categoria_id)

@router.post("/{insumo_id}/compra")
def agregar_compra(insumo_id: int, cantidad: int, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    return insumo_crud.agregar_compra(insumo_id, cantidad, session)