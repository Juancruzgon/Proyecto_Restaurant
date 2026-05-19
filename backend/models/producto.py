from sqlmodel import SQLModel, Field
from typing import Optional
from decimal import Decimal

class Producto(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(unique=True, index=True)
    descripcion: Optional[str] = None
    precio: Decimal = Field(max_digits=10, decimal_places=2)
    categoria_id: int = Field(foreign_key="categoriaproducto.id")
    activo: bool = Field(default=True)
    descuento: Optional[int] = None
    imagen_url: Optional[str] = Field(default=None)
    tipo: str = Field(default="sin_receta")  # sin_receta / con_receta
    insumo_id: Optional[int] = Field(default=None, foreign_key="insumo.id")
    agotado: bool = Field(default=False)