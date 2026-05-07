from datetime import date, time, datetime
from sqlmodel import SQLModel, Field
from typing import Optional
from decimal import Decimal

class GestorNegocio(SQLModel, table=True):
    id: int = Field(default=1, primary_key=True)
    nombre: str
    direccion: str
    telefono: str

class GestorImpresora(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str
    puerto: int
    ip: str
    tipo: str