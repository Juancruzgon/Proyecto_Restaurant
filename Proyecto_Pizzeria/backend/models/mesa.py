from datetime import date, time, datetime
from sqlmodel import SQLModel, Field
from typing import Optional
from decimal import Decimal
from .salon import Salon

class EstadoMesa(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(unique=True) # "Libre", "Ocupada", etc.
    descripcion: Optional[str] = None

class Mesa(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nro_id: int = Field(index=True)  # ← sacá el unique=True
    estado_id: int = Field(foreign_key="estadomesa.id")
    capacidad: int
    salon_id: Optional[int] = Field(default=None, foreign_key="salon.id")
    activo: bool = Field(default=True)
