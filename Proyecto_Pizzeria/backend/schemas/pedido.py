import pydantic
from typing import Optional
from decimal import Decimal

class PedidoCreate(pydantic.BaseModel):
    tipo_pedido: str
    mesa_id: Optional[int] = None
    usuario_id: Optional[int] = None
    pager: Optional[str] = None

class PedidoModify(pydantic.BaseModel):
    tipo_pedido: Optional[str] = None
    mesa_id: Optional[int] = None
    usuario_id: Optional[int] = None
    pager: Optional[str] = None

class DetallePedidoCreate(pydantic.BaseModel):
    producto_id: int
    cantidad: int
    nota: Optional[str] = None

class DetallePedidoModifyNota(pydantic.BaseModel):
    nota: Optional[str] = None