import pydantic
from typing import Optional
from decimal import Decimal

class InsumoCreate(pydantic.BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    precio: Decimal
    stock_actual: float = 0
    nro_insumo: int
    categoria_id: int
    unidad_medida: str = "unidad"
    tipo: str = "sin_receta"
    imagen_url: Optional[str] = None

class InsumoModify(pydantic.BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    precio: Optional[Decimal] = None
    stock_actual: Optional[float] = None
    categoria_id: Optional[int] = None
    unidad_medida: Optional[str] = None
    tipo: Optional[str] = None
    imagen_url: Optional[str] = None

class RecetaProductoCreate(pydantic.BaseModel):
    producto_id: int
    insumo_id: int
    cantidad: float

class RecetaProductoModify(pydantic.BaseModel):
    cantidad: Optional[float] = None