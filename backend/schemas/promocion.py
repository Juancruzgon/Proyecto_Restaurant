import pydantic
from typing import Optional
from decimal import Decimal
from datetime import datetime

class PromocionCreate(pydantic.BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    precio: Decimal
    valida_desde: Optional[datetime] = None
    valida_hasta: Optional[datetime] = None

class PromocionModify(pydantic.BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    precio: Optional[Decimal] = None
    valida_desde: Optional[datetime] = None
    valida_hasta: Optional[datetime] = None

class PromocionProductoCreate(pydantic.BaseModel):
    producto_id: int
    cantidad: int = 1