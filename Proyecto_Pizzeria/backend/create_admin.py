from database import engine
from models.usuario import Usuario
from models.rol import Rol
from auth import hashear_password
from sqlmodel import Session

with Session(engine) as session:
    admin = Usuario(
        nombre="Admin",
        apellido="Sistema",
        email="admin@pizzeria.com",
        password=hashear_password("admin123"),
        rol_id=1,
        activo=True
    )
    session.add(admin)
    session.commit()
    print("Admin creado exitosamente")