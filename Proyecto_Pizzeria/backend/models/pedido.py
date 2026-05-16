from datetime import date, time, datetime
from sqlmodel import SQLModel, Field
from typing import Optional
from decimal import Decimal

class Pedido(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nro_pedido: int = Field(index=True)
    tipo_pedido: str  # "Salon", "Takeaway", "Delivery"
    estado_id: int = Field(foreign_key="estadopedido.id")
    mesa_id: Optional[int] = Field(default=None, foreign_key="mesa.id")
    usuario_id: Optional[int] = Field(default=None, foreign_key="usuario.id")
    total: Decimal = Field(default=0, max_digits=10, decimal_places=2)
    fecha: date = Field(default_factory=date.today)
    hora: time = Field(default_factory=lambda: datetime.now().time())
    activo: bool = Field(default=True)
    pager: Optional[str] = Field(default=None)
    caja_id: Optional[int] = Field(default=None, foreign_key="caja.id")
    metodo_pago: Optional[str] = Field(default=None)
    ultimo_detalle_impreso: int = Field(default=0)
    nombre_cliente: Optional[str] = Field(default=None)
    telefono_cliente: Optional[str] = Field(default=None)
    direccion_cliente: Optional[str] = Field(default=None)
    listo_cocina: bool = Field(default=True)

class DetallePedido(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedido.id")
    producto_id: int = Field(foreign_key="producto.id")
    cantidad: int
    precio_unitario: Decimal = Field(max_digits=10, decimal_places=2)
    subtotal: Decimal = Field(max_digits=10, decimal_places=2)
    nota: Optional[str] = Field(default=None)
    cantidad_pagada: int = Field(default=0)  