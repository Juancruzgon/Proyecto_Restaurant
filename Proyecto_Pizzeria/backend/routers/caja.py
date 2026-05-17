from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from backend.core.database import get_session
from models.usuario import Usuario
from models.caja import Caja
from models.pedido import Pedido
from backend.core.auth import get_current_user
from datetime import datetime

router = APIRouter(
    prefix="/caja",
    tags=["caja"]
)

@router.get("/activa")
def obtener_caja_activa(session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    caja = session.exec(select(Caja).where(Caja.activo == True)).first()
    return caja

@router.post("/abrir")
def abrir_caja(session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    if current_user.rol_id != 1:
        raise HTTPException(status_code=403, detail="Solo el admin puede abrir la caja")
    caja_activa = session.exec(select(Caja).where(Caja.activo == True)).first()
    if caja_activa:
        raise HTTPException(status_code=400, detail="Ya hay una caja abierta")
    nueva_caja = Caja(usuario_id=current_user.id)
    session.add(nueva_caja)
    session.commit()
    session.refresh(nueva_caja)
    return nueva_caja

@router.put("/cerrar")
def cerrar_caja(session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    if current_user.rol_id != 1:
        raise HTTPException(status_code=403, detail="Solo el admin puede cerrar la caja")
    caja = session.exec(select(Caja).where(Caja.activo == True)).first()
    if not caja:
        raise HTTPException(status_code=404, detail="No hay caja abierta")
    # Validar que no haya pedidos activos
    pedidos_activos = session.exec(
        select(Pedido).where(Pedido.caja_id == caja.id, Pedido.activo == True)
    ).all()
    if pedidos_activos:
        raise HTTPException(
            status_code=400,
            detail=f"Hay {len(pedidos_activos)} pedido(s) activo(s). Cerrá o cobrá todos los pedidos antes de cerrar la caja."
        )
    # Calcular totales del turno
    pedidos = session.exec(
        select(Pedido).where(
            Pedido.caja_id == caja.id,
            Pedido.estado_id == 4
        )
    ).all()
    caja.total_ventas  = sum(p.total for p in pedidos)
    caja.total_pedidos = len(pedidos)
    caja.fecha_cierre  = datetime.now()
    caja.activo        = False
    session.add(caja)
    session.commit()
    session.refresh(caja)
    return caja

@router.get("/historial")
def historial_cajas(session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    cajas = session.exec(select(Caja).order_by(Caja.fecha_apertura.desc())).all()
    resultado = []
    for c in cajas:
        usuario = session.get(Usuario, c.usuario_id)
        resultado.append({
            "id": c.id,
            "usuario": f"{usuario.nombre} {usuario.apellido}" if usuario else "—",
            "fecha_apertura": c.fecha_apertura,
            "fecha_cierre": c.fecha_cierre,
            "total_ventas": float(c.total_ventas),
            "total_pedidos": c.total_pedidos,
            "activo": c.activo,
        })
    return resultado