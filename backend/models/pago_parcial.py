from datetime import date
from sqlmodel import SQLModel, Field
from typing import Optional
from decimal import Decimal

class PagoParcial(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedido.id")
    detalle_id: int = Field(foreign_key="detallepedido.id")
    cantidad: int
    metodo: str  # efectivo / tarjeta / qr
    monto: Decimal = Field(max_digits=10, decimal_places=2)
    fecha: date = Field(default_factory=date.today)