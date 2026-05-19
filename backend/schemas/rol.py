import pydantic
from typing import Optional
from decimal import Decimal

class RolCreate(pydantic.BaseModel):
    nombre: str
    descripcion: Optional[str] = None

class RolModify(pydantic.BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None