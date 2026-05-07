from database import engine
from sqlmodel import SQLModel
import models.usuario
import models.pedido
import models.producto
import models.mesa
import models.rol
import models.categoria_producto
import models.categoria_gasto
import models.gasto
import models.insumo
import models.salon
import models.categoria_insumo
import models.promocion

def create_db_and_tables():
    print("Conectando con la base de datos y creando tablas...")
    SQLModel.metadata.create_all(engine)
    print("¡Tablas creadas con éxito en pgAdmin!")

if __name__ == "__main__":
    create_db_and_tables()