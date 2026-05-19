from sqlmodel import SQLModel, Field
from typing import Optional

class RecetaProducto(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    producto_id: int = Field(foreign_key="producto.id")
    insumo_id: int = Field(foreign_key="insumo.id")
    cantidad: float  # cantidad de insumo por unidad de producto