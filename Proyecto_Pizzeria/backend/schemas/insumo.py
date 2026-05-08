import pydantic
from typing import Optional
from decimal import Decimal

class InsumoCreate(pydantic.BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    precio: Decimal
    stock_actual: int = 0
    nro_insumo: int
    categoria_id: int
    
class InsumoModify(pydantic.BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    precio: Optional[Decimal] = None
    stock_actual: Optional[int] = None
    categoria_id: Optional[int] = None