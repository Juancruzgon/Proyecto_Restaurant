from sqlmodel import Session, select
from database import get_session
from models.usuario import Usuario
from models.receta import RecetaProducto
from models.insumo import Insumo
from schemas.insumo import RecetaProductoCreate, RecetaProductoModify
from auth import get_current_user
from fastapi import APIRouter, Depends, HTTPException


router = APIRouter(
    prefix="/recetas",
    tags=["recetas"]
)

@router.get("/producto/{producto_id}")
def obtener_receta(producto_id: int, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    recetas = session.exec(
        select(RecetaProducto).where(RecetaProducto.producto_id == producto_id)
    ).all()
    resultado = []
    for r in recetas:
        insumo = session.get(Insumo, r.insumo_id)
        resultado.append({
            "id": r.id,
            "producto_id": r.producto_id,
            "insumo_id": r.insumo_id,
            "cantidad": r.cantidad,
            "insumo_nombre": insumo.nombre if insumo else None,
            "unidad_medida": insumo.unidad_medida if insumo else None,
        })
    return resultado

@router.post("/")
def agregar_ingrediente(receta: RecetaProductoCreate, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    if current_user.rol_id != 1:
        raise HTTPException(status_code=403, detail="Solo el admin puede modificar recetas")
    nuevo = RecetaProducto(**receta.model_dump())
    session.add(nuevo)
    session.commit()
    session.refresh(nuevo)
    return nuevo

@router.put("/{receta_id}")
def modificar_ingrediente(receta_id: int, datos: RecetaProductoModify, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    if current_user.rol_id != 1:
        raise HTTPException(status_code=403, detail="Solo el admin puede modificar recetas")
    rec = session.get(RecetaProducto, receta_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Ingrediente no encontrado")
    for attr, value in datos.model_dump(exclude_unset=True).items():
        setattr(rec, attr, value)
    session.add(rec)
    session.commit()
    session.refresh(rec)
    return rec

@router.delete("/{receta_id}")
def eliminar_ingrediente(receta_id: int, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    if current_user.rol_id != 1:
        raise HTTPException(status_code=403, detail="Solo el admin puede modificar recetas")
    rec = session.get(RecetaProducto, receta_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Ingrediente no encontrado")
    session.delete(rec)
    session.commit()
    return {"detail": "Ingrediente eliminado"}