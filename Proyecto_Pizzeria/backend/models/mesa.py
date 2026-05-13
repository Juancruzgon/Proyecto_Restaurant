from typing import Optional
from sqlmodel import SQLModel, Field

class Mesa(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nro_id: int = Field(index=True)
    estado_id: int = Field(foreign_key="estadomesa.id")
    capacidad: int
    salon_id: Optional[int] = Field(default=None, foreign_key="salon.id")
    activo: bool = Field(default=True)
    pos_x: Optional[float] = Field(default=None)
    pos_y: Optional[float] = Field(default=None)