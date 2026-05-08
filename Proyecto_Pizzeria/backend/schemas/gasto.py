import pydantic
from typing import Optional
from decimal import Decimal

class GastoCreate(pydantic.BaseModel):
    nombre: str
    descripcion: str
    monto: Decimal
    categoria_id: int 

class GastoModify(pydantic.BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    monto: Optional[Decimal] = None
    categoria_id: Optional[int] = None