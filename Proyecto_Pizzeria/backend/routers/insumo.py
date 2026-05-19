from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
import pydantic
from core.database import get_session
from models.usuario import Usuario
from models.insumo import Insumo, MovimientoStock
from schemas.insumo import InsumoCreate, InsumoModify
from crud import insumo as insumo_crud
from core.auth import get_current_user
from typing import Optional

class CompraCreate(pydantic.BaseModel):
    cantidad: float
    monto: float

class AjusteCreate(pydantic.BaseModel):
    cantidad: float  # positivo = entrada, negativo = salida
    nota: str

router = APIRouter(
    prefix="/insumos",
    tags=["insumos"]
)

@router.get("/")
def obtener_insumos(categoria_id: int = None, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    return insumo_crud.obtener_insumos(session, categoria_id)

@router.get("/stock-bajo")
def obtener_stock_bajo(session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    insumos = session.exec(select(Insumo)).all()
    return [i for i in insumos if i.stock_minimo > 0 and i.stock_actual <= i.stock_minimo]

@router.get("/{insumo_id}")
def obtener_insumo(insumo_id: int, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    insumo = session.get(Insumo, insumo_id)
    if not insumo:
        raise HTTPException(status_code=404, detail="Insumo no encontrado")
    return insumo

@router.post("/")
def crear_insumo(insumo: InsumoCreate, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    return insumo_crud.crear_insumo(insumo, session)

@router.put("/{insumo_id}")
def modificar_insumo(insumo_id: int, insumo: InsumoModify, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    return insumo_crud.modificar_insumo(insumo_id, insumo, session)

@router.delete("/{insumo_id}")
def eliminar_insumo(insumo_id: int, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    return insumo_crud.eliminar_insumo(insumo_id, session)

@router.post("/{insumo_id}/compra")
def agregar_compra(insumo_id: int, compra: CompraCreate, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    return insumo_crud.agregar_compra(
        insumo_id=insumo_id,
        cantidad=compra.cantidad,
        monto=compra.monto,
        usuario_id=current_user.id,
        session=session,
    )

@router.post("/{insumo_id}/ajuste")
def ajustar_stock(insumo_id: int, ajuste: AjusteCreate, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    if current_user.rol_id != 1:
        raise HTTPException(status_code=403, detail="Solo el admin puede ajustar stock")
    insumo = session.get(Insumo, insumo_id)
    if not insumo:
        raise HTTPException(status_code=404, detail="Insumo no encontrado")
    if not ajuste.nota.strip():
        raise HTTPException(status_code=400, detail="La nota es obligatoria para ajustes manuales")
    insumo.stock_actual += ajuste.cantidad
    movimiento = MovimientoStock(
        nro_id=insumo_id,
        id_insumo=insumo_id,
        cantidad=ajuste.cantidad,
        tipo_movimiento="ajuste",
        nota=ajuste.nota,
    )
    session.add(movimiento)
    session.add(insumo)
    session.commit()
    session.refresh(insumo)
    return insumo

@router.get("/{insumo_id}/movimientos")
def obtener_movimientos(insumo_id: int, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    insumo = session.get(Insumo, insumo_id)
    if not insumo:
        raise HTTPException(status_code=404, detail="Insumo no encontrado")
    movimientos = session.exec(
        select(MovimientoStock)
        .where(MovimientoStock.id_insumo == insumo_id)
        .order_by(MovimientoStock.fecha.desc(), MovimientoStock.id.desc())
    ).all()
    return [
        {
            "id":               m.id,
            "fecha":            str(m.fecha),
            "cantidad":         float(m.cantidad),
            "tipo_movimiento":  m.tipo_movimiento,
            "nota":             m.nota,
        }
        for m in movimientos
    ]