import pydantic
from typing import Optional
from decimal import Decimal

class ProductoCreate(pydantic.BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    precio: Decimal
    categoria_id: int
    imagen_url: Optional[str] = None
    tipo: str = "sin_receta"
    insumo_id: Optional[int] = None

class ProductoModify(pydantic.BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    precio: Optional[Decimal] = None
    categoria_id: Optional[int] = None
    descuento: Optional[int] = None
    imagen_url: Optional[str] = None
    tipo: Optional[str] = None
    insumo_id: Optional[int] = None
    agotado: Optional[bool] = None