import pydantic
from typing import Optional

class RecordatorioCreate(pydantic.BaseModel):
    titulo: str
    descripcion: Optional[str] = None

class RecordatorioModify(pydantic.BaseModel):
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    leido: Optional[bool] = None