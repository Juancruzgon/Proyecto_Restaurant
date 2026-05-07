from datetime import date, time, datetime
from sqlmodel import SQLModel, Field
from typing import Optional
from decimal import Decimal

class CategoriaProducto(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(unique=False)
    parent_id: Optional[int] = Field(default=None, foreign_key="categoriaproducto.id")

