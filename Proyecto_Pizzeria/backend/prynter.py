from escpos.printer import Network
from datetime import datetime
from models.pedido import Pedido, DetallePedido   

def imprimir_comanda(pedido: Pedido, detalles: list[DetallePedido], ip_impresora: str, puerto: int = 9100):
    try:
        p = Network(ip_impresora, port=puerto)
        p.text(f"Pedido #{pedido.nro_pedido}\n")
        p.text(f"Fecha: {pedido.fecha}\n")
        p.text(f"Hora: {pedido.hora}\n")
        p.text("------------------------\n")
        for detalle in detalles:
            p.text(f"{detalle.cantidad}x - Producto ID: {detalle.producto_id}\n")
        p.text("------------------------\n")
        p.cut()
    except Exception as e:
        print(f"Error al imprimir: {e}")