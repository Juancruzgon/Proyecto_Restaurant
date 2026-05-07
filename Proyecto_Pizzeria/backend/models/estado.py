from datetime import date, time, datetime
from sqlmodel import SQLModel, Field
from typing import Optional
from decimal import Decimal


class EstadoMesa(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(unique=True) # "Libre", "Ocupada", etc.
    descripcion: Optional[str] = None

class EstadoPedido(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(unique=True) # "Abierto", "Cerrado", "Cancelado"
    descripcion: Optional[str] = None