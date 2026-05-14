from datetime import date
from sqlmodel import SQLModel, Field
from typing import Optional
from decimal import Decimal

class Gasto(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str
    descripcion: Optional[str] = None
    categoria_id: int = Field(foreign_key="categoriagasto.id")
    monto: Decimal = Field(max_digits=10, decimal_places=2)
    fecha: date = Field(default_factory=date.today)
    usuario_id: Optional[int] = Field(default=None, foreign_key="usuario.id")
    cantidad: Optional[float] = None