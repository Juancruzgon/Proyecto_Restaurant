import pydantic
from typing import Optional
 
class MesaCreate(pydantic.BaseModel):
    nro_id: int
    capacidad: int
    salon_id: Optional[int] = None
 
class MesaModify(pydantic.BaseModel):
    nro_id: Optional[int] = None
    capacidad: Optional[int] = None
    estado_id: Optional[int] = None
    salon_id: Optional[int] = None
    pos_x: Optional[float] = None
    pos_y: Optional[float] = None
 
class MesaPosicion(pydantic.BaseModel):
    pos_x: float
    pos_y: float