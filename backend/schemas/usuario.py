import pydantic
from typing import Optional
from decimal import Decimal

class UsuarioCreate(pydantic.BaseModel):
    email: str
    password: str
    nombre: str
    apellido: str
    rol_id: int

class UsuarioModify(pydantic.BaseModel):
    email: Optional[str] = None
    password: Optional[str] = None
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    rol_id: Optional[int] = None