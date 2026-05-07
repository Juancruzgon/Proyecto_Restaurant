from datetime import date, time, datetime
from sqlmodel import SQLModel, Field
from typing import Optional
from decimal import Decimal

class Producto(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(unique=True, index=True)
    descripcion : Optional[str] = None
    precio: Decimal = Field(max_digits=10, decimal_places=2)
    categoria_id: int = Field(foreign_key="categoriaProducto.id")
    activo: bool = Field(default=True)
    descuento: Optional[int] = None
