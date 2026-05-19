import pydantic
from typing import Optional
from decimal import Decimal

class GastoCreate(pydantic.BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    monto: Decimal
    categoria_id: int
    usuario_id: Optional[int] = None
    cantidad: Optional[float] = None

class GastoModify(pydantic.BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    monto: Optional[Decimal] = None
    categoria_id: Optional[int] = None
    usuario_id: Optional[int] = None
    cantidad: Optional[float] = None