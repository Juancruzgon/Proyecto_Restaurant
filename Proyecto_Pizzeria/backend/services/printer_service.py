import os
from escpos.printer import Network
from models.pedido import Pedido

def _conectar(ip: str, puerto: int = 9100):
    return Network(ip, port=puerto)

def imprimir_comanda(pedido: Pedido, detalles: list, ip_impresora: str, puerto: int = 9100):
    try:
        p = _conectar(ip_impresora, puerto)

        p.set(align='center', bold=True, double_height=True, double_width=True)
        p.text("COMANDA\n")
        p.set(align='center', bold=False, double_height=False, double_width=False)
        p.text("------------------------\n")

        p.set(bold=True)
        if pedido.mesa_id:
            p.text(f"Mesa: {pedido.mesa_id}\n")
        elif pedido.tipo_pedido == 'Takeaway' and pedido.pager:
            p.text(f"Takeaway - Pager: {pedido.pager}\n")
        elif pedido.tipo_pedido == 'Delivery':
            p.text("DELIVERY\n")
        else:
            p.text(f"{pedido.tipo_pedido}\n")

        p.set(bold=False)
        p.text(f"Pedido #{pedido.nro_pedido}\n")
        p.text(f"Hora: {str(pedido.hora)[:5]}\n")
        if pedido.tipo_pedido == 'Delivery':
            if getattr(pedido, 'nombre_cliente', None):
                p.text(f"Cliente: {pedido.nombre_cliente}\n")
            if getattr(pedido, 'telefono_cliente', None):
                p.text(f"Tel: {pedido.telefono_cliente}\n")
            if getattr(pedido, 'direccion_cliente', None):
                p.text(f"Dir: {pedido.direccion_cliente}\n")
        p.text("------------------------\n")

        for detalle in detalles:
            nombre = detalle.get('nombre') or f"Producto {detalle.get('producto_id', '')}"
            p.set(bold=True)
            p.text(f"{detalle['cantidad']}x  {nombre}\n")
            p.set(bold=False)
            if detalle.get('nota'):
                p.text(f"   >> {detalle['nota']}\n")

        p.text("------------------------\n")
        p.cut()
    except Exception as e:
        print(f"Error al imprimir comanda: {e}")


def imprimir_ticket(pedido: Pedido, detalles: list, ip_impresora: str, puerto: int = 9100, nombre_local: str = "Restaurante"):
    try:
        p = _conectar(ip_impresora, puerto)

        p.set(align='center', bold=True, double_height=True, double_width=True)
        p.text(f"{nombre_local}\n")
        p.set(align='center', bold=False, double_height=False, double_width=False)
        p.text("------------------------\n")

        if pedido.mesa_id:
            p.text(f"Mesa: {pedido.mesa_id}\n")
        elif pedido.tipo_pedido == 'Takeaway' and pedido.pager:
            p.text(f"Takeaway - Pager: {pedido.pager}\n")
        elif pedido.tipo_pedido == 'Delivery':
            p.text("DELIVERY\n")
        else:
            p.text(f"{pedido.tipo_pedido}\n")

        p.text(f"Pedido #{pedido.nro_pedido}\n")
        p.text(f"Fecha: {pedido.fecha}  Hora: {str(pedido.hora)[:5]}\n")
        if pedido.tipo_pedido == 'Delivery':
            if getattr(pedido, 'nombre_cliente', None):
                p.text(f"Cliente: {pedido.nombre_cliente}\n")
            if getattr(pedido, 'telefono_cliente', None):
                p.text(f"Tel: {pedido.telefono_cliente}\n")
            if getattr(pedido, 'direccion_cliente', None):
                p.text(f"Dir: {pedido.direccion_cliente}\n")
        p.text("------------------------\n")

        for detalle in detalles:
            nombre   = detalle.get('nombre') or f"Producto {detalle.get('producto_id', '')}"
            subtotal = detalle.get('subtotal', 0)
            cant     = detalle['cantidad']
            precio   = detalle.get('precio_unitario', 0)
            p.text(f"{cant}x {nombre}\n")
            p.text(f"   ${precio} c/u  =  ${subtotal}\n")

        p.text("------------------------\n")
        p.set(bold=True, double_height=True)
        p.text(f"TOTAL: ${pedido.total}\n")
        p.set(bold=False, double_height=False)
        p.text("------------------------\n")
        p.set(align='center')
        p.text("Gracias por su visita!\n")
        p.text("\n")
        p.cut()
    except Exception as e:
        print(f"Error al imprimir ticket: {e}")