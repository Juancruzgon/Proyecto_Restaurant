from datetime import datetime
from sqlmodel import SQLModel, Field
from typing import Optional
from decimal import Decimal

class Caja(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id")
    fecha_apertura: datetime = Field(default_factory=datetime.now)
    fecha_cierre: Optional[datetime] = None
    total_ventas: Decimal = Field(default=0, max_digits=10, decimal_places=2)
    total_pedidos: int = Field(default=0)
    activo: bool = Field(default=True)