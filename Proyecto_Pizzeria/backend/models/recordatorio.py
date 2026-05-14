from datetime import date, time, datetime
from sqlmodel import SQLModel, Field
from typing import Optional


class Recordatorio(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    titulo: str
    descripcion: Optional[str] = None
    leido: bool = Field(default=False)
    fecha: date = Field(default_factory=date.today)
    usuario_id: int = Field(foreign_key="usuario.id")  # quien lo creó