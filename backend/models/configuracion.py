from sqlmodel import SQLModel, Field
from typing import Optional
from decimal import Decimal

class Configuracion(SQLModel, table=True):
    id: int = Field(default=1, primary_key=True)

    # Local
    nombre_local: str = Field(default="Mi Restaurante")
    logo_url: Optional[str] = Field(default=None)

    # Pantalla cocina
    mostrar_cocina: bool = Field(default=True)

    # Impresora cocina (comanda)
    imprimir_comanda_cocina: bool = Field(default=False)
    printer_cocina_ip: Optional[str] = Field(default=None)
    printer_cocina_puerto: int = Field(default=9100)

    # Impresora ticket (cliente)
    imprimir_ticket_cliente: bool = Field(default=False)
    printer_ticket_ip: Optional[str] = Field(default=None)
    printer_ticket_puerto: int = Field(default=9100)

    # Cubiertos
    cubiertos_activo: bool = Field(default=False)
    precio_cubierto: Decimal = Field(default=0, max_digits=10, decimal_places=2)
