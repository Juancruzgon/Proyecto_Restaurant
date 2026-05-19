from datetime import date, time, datetime
from sqlmodel import SQLModel, Field
from typing import Optional
from decimal import Decimal

class Promocion(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str
    descripcion: Optional[str] = None
    precio: Decimal = Field(max_digits=10, decimal_places=2)
    valida_desde: Optional[datetime] = None
    valida_hasta: Optional[datetime] = None
    activo: bool = Field(default=True)

class PromocionProducto(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    promocion_id: int = Field(foreign_key="promocion.id")
    producto_id: int = Field(foreign_key="producto.id")
    cantidad: int = Field(default=1)


