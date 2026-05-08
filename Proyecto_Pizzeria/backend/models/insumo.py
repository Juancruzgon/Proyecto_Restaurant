from datetime import date, time, datetime
from sqlmodel import SQLModel, Field
from typing import Optional
from decimal import Decimal


class Insumo(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nro_insumo :int = Field(index=True)
    nombre: str = Field(unique=True, index=True)
    stock_actual: int
    descripcion: Optional[str] = None
    precio: Decimal = Field(max_digits=10, decimal_places=2)
    categoria_id: int = Field(foreign_key="categoriainsumo.id")

class MovimientoStock(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nro_id: int = Field(index=True)
    id_insumo:int = Field(foreign_key="insumo.id")
    cantidad: int
    fecha: date = Field(default_factory=date.today)
    #tipo: str  # "entrada" | "salida"