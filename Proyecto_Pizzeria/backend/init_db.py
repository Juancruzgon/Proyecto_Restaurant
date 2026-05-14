from database import engine
from sqlmodel import SQLModel
from models.usuario import Usuario
from models.pedido import Pedido, DetallePedido
from models.producto import Producto
from models.mesa import Mesa
from models.rol import Rol
from models.categoria_producto import CategoriaProducto
from models.categoria_gasto import CategoriaGasto 
from models.gasto import Gasto
from models.insumo import Insumo, MovimientoStock
from models.salon import Salon
from models.categoria_insumo import CategoriaInsumo
from models.promocion import Promocion
from models.estado import EstadoMesa, EstadoPedido
from models.gestor import GestorNegocio, GestorImpresora
from models.recordatorio import Recordatorio
from models.receta import RecetaProducto
from models.caja import Caja
from models.pago import Pago

def create_db_and_tables():
    print("Conectando con la base de datos y creando tablas...")
    SQLModel.metadata.create_all(engine)
    print("¡Tablas creadas con éxito en pgAdmin!")

if __name__ == "__main__":
    create_db_and_tables()