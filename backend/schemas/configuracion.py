import pydantic
from typing import Optional
from decimal import Decimal

class ConfiguracionModify(pydantic.BaseModel):
    nombre_local: Optional[str] = None
    logo_url: Optional[str] = None
    mostrar_cocina: Optional[bool] = None
    imprimir_comanda_cocina: Optional[bool] = None
    printer_cocina_ip: Optional[str] = None
    printer_cocina_puerto: Optional[int] = None
    imprimir_ticket_cliente: Optional[bool] = None
    printer_ticket_ip: Optional[str] = None
    printer_ticket_puerto: Optional[int] = None
    cubiertos_activo: Optional[bool] = None
    precio_cubierto: Optional[Decimal] = None
