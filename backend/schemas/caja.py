import pydantic
from typing import Optional
from decimal import Decimal
from datetime import datetime

class CajaOpen(pydantic.BaseModel):
    pass  # solo necesita el usuario del token

class CajaClose(pydantic.BaseModel):
    pass  # solo necesita el id de la caja activa