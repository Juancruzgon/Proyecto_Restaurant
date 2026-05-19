from fastapi import APIRouter, Depends
from sqlmodel import Session
from core.database import get_session
from models.configuracion import Configuracion
from schemas.configuracion import ConfiguracionModify
from models.usuario import Usuario
from core.auth import get_current_user

router = APIRouter(prefix="/configuracion", tags=["configuracion"])

@router.get("/")
def get_configuracion(session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    config = session.get(Configuracion, 1)
    if not config:
        config = Configuracion()
        session.add(config)
        session.commit()
        session.refresh(config)
    return config

@router.put("/")
def update_configuracion(data: ConfiguracionModify, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    config = session.get(Configuracion, 1)
    if not config:
        config = Configuracion()
    for attr, value in data.model_dump(exclude_unset=True).items():
        setattr(config, attr, value)
    session.add(config)
    session.commit()
    session.refresh(config)
    return config
