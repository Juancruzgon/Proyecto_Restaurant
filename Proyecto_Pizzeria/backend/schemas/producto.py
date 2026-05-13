import pydantic
from typing import Optional
from decimal import Decimal

class ProductoCreate(pydantic.BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    precio: Decimal
    categoria_id: int
    imagen_url: Optional[str] = None

class ProductoModify(pydantic.BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    precio: Optional[Decimal] = None
    categoria_id: Optional[int] = None
    descuento: Optional[int] = None
    imagen_url: Optional[str] = None