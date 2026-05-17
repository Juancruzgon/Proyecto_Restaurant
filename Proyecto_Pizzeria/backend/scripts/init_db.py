from backend.core.database import engine
from sqlmodel import SQLModel
from backend.models.usuario import Usuario
from backend.models.pedido import Pedido, DetallePedido
from backend.models.producto import Producto
from backend.models.mesa import Mesa
from backend.models.rol import Rol
from backend.models.categoria_producto import CategoriaProducto
from backend.models.categoria_gasto import CategoriaGasto 
from backend.models.gasto import Gasto
from backend.models.insumo import Insumo, MovimientoStock
from backend.models.salon import Salon
from backend.models.categoria_insumo import CategoriaInsumo
from backend.models.promocion import Promocion
from models.estado import EstadoMesa, EstadoPedido
from backend.models.gestor import GestorNegocio, GestorImpresora
from backend.models.recordatorio import Recordatorio
from backend.models.receta import RecetaProducto
from backend.models.caja import Caja
from backend.models.pago import Pago
from backend.models.pago_parcial import PagoParcial

def create_db_and_tables():
    print("Conectando con la base de datos y creando tablas...")
    SQLModel.metadata.create_all(engine)
    print("¡Tablas creadas con éxito en pgAdmin!")

if __name__ == "__main__":
    create_db_and_tables()