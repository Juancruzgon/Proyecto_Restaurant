from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database import get_session
from models.usuario import Usuario
from models.recordatorio import Recordatorio
from schemas.recordatorio import RecordatorioCreate, RecordatorioModify
from auth import get_current_user

router = APIRouter(
    prefix="/recordatorios",
    tags=["recordatorios"]
)

@router.get("/")
def obtener_recordatorios(session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    return session.exec(select(Recordatorio).where(Recordatorio.leido == False)).all()

@router.post("/")
def crear_recordatorio(recordatorio: RecordatorioCreate, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    if current_user.rol_id != 1:
        raise HTTPException(status_code=403, detail="Solo el admin puede crear recordatorios")
    nuevo = Recordatorio(**recordatorio.model_dump(), usuario_id=current_user.id)
    session.add(nuevo)
    session.commit()
    session.refresh(nuevo)
    return nuevo

@router.put("/{recordatorio_id}/leido")
def marcar_leido(recordatorio_id: int, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    rec = session.get(Recordatorio, recordatorio_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Recordatorio no encontrado")
    rec.leido = True
    session.add(rec)
    session.commit()
    return {"detail": "Marcado como leído"}

@router.delete("/{recordatorio_id}")
def eliminar_recordatorio(recordatorio_id: int, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    if current_user.rol_id != 1:
        raise HTTPException(status_code=403, detail="Solo el admin puede eliminar recordatorios")
    rec = session.get(Recordatorio, recordatorio_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Recordatorio no encontrado")
    session.delete(rec)
    session.commit()
    return {"detail": "Recordatorio eliminado"}