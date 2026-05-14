from datetime import date
from sqlmodel import SQLModel, Field
from typing import Optional
from decimal import Decimal

class Pago(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedido.id")
    metodo: str  # efectivo / tarjeta / qr
    monto: Decimal = Field(max_digits=10, decimal_places=2)
    fecha: date = Field(default_factory=date.today)