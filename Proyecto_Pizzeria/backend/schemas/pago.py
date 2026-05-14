import pydantic
from typing import Optional
from decimal import Decimal

class PagoCreate(pydantic.BaseModel):
    metodo: str
    monto: Decimal

class CobrarPedidoRequest(pydantic.BaseModel):
    pagos: list[PagoCreate]