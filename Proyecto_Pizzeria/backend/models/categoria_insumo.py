from datetime import date, time, datetime
from sqlmodel import SQLModel, Field
from typing import Optional
from decimal import Decimal

class CategoriaInsumo(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str
    descripcion: Optional[str] = None
    parent_id: Optional[int] = Field(default=None, foreign_key="categoriainsumo.id")
    imagen_url: Optional[str] = Field(default=None)