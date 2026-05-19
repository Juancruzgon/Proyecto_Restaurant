import pydantic
from typing import Optional
from decimal import Decimal


class Login(pydantic.BaseModel):
    email: str
    password: str