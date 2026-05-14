import pydantic
from typing import Optional
from decimal import Decimal

class SalonCreate(pydantic.BaseModel):
    nombre: str
    descripcion: Optional[str] = None

class SalonModify(pydantic.BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    ancho: Optional[float] = None
    alto: Optional[float] = None