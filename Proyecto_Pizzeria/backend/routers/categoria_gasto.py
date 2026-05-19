from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from core.database import get_session
from models.usuario import Usuario
from schemas.categoria_gasto import CategoriaGastoCreate, CategoriaGastoModify
from crud import categoria_gasto
from core.auth import get_current_user

router = APIRouter(
    prefix="/categorias-gastos",
    tags=["categorias-gastos"]
)


@router.get("/")
def obtener_categorias_gastos(session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    return categoria_gasto.obtener_categoria_gastos(session)

@router.post("/")
def crear_categoria_gasto(categoria: CategoriaGastoCreate, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    return categoria_gasto.crear_categoria_gasto(categoria, session)

@router.put("/{categoria_id}")
def modificar_categoria_gasto(categoria_id: int, categoria: CategoriaGastoModify, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    return categoria_gasto.modificar_categoria_gasto(categoria_id, categoria, session)

@router.delete("/{categoria_id}")
def eliminar_categoria_gasto(categoria_id: int, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    return categoria_gasto.eliminar_categoria_gasto(categoria_id, session)
