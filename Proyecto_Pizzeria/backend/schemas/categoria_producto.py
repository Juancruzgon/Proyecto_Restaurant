import pydantic
from typing import Optional
from decimal import Decimal

class CategoriaProductoCreate(pydantic.BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    parent_id: Optional[int] = None
    imagen_url: Optional[str] = None

class CategoriaProductoModify(pydantic.BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    parent_id: Optional[int] = None
    imagen_url: Optional[str] = None