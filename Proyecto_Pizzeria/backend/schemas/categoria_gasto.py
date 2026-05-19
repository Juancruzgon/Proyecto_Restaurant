import pydantic
from typing import Optional
from decimal import Decimal

class CategoriaGastoCreate(pydantic.BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    imagen_url: Optional[str] = None

class CategoriaGastoModify(pydantic.BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    imagen_url: Optional[str] = None