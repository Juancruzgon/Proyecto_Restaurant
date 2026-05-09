# Sistema de Gestión Operativa para Restaurantes

Sistema web completo para la gestión operativa de restaurantes — pedidos, mesas, productos, insumos, gastos y usuarios, con comunicación en tiempo real.

---

## Tecnologías

**Backend**
- Python + FastAPI
- SQLModel + PostgreSQL
- JWT (autenticación)
- WebSockets (tiempo real)
- bcrypt (seguridad)

**Frontend**
- React + Vite
- React Router
- Axios
- Tailwind CSS

---

## Funcionalidades

### Operación
- Mapa de mesas en tiempo real — verde (libre) / rojo (ocupada)
- Mesas organizadas por salón
- Creación y gestión de pedidos desde el mapa
- Selección de productos por categorías (hasta 3 niveles jerárquicos)
- Estados de pedido: Creado → En preparación → Listo → Pagado
- Actualización automática en todos los dispositivos vía WebSockets

### Administración
- ABM de productos con categorías autorreferenciales
- ABM de usuarios con roles (administrador / mozo)
- Control de insumos con stock y registro de compras
- Registro de gastos por categoría
- ABM de mesas y salones

### Seguridad
- Autenticación con JWT
- Contraseñas hasheadas con bcrypt
- Rutas protegidas según rol del usuario
- Borrado lógico en todas las entidades

---

## Estructura del proyecto

```
├── backend/
│   ├── models/          # Modelos SQLModel por módulo
│   ├── crud/            # Lógica de negocio por módulo
│   ├── routers/         # Endpoints FastAPI por módulo
│   ├── schemas/         # Schemas Pydantic por módulo
│   ├── auth.py          # JWT + bcrypt
│   ├── database.py      # Conexión PostgreSQL
│   ├── main.py          # App principal + WebSockets
│   └── websocket_manager.py
└── frontend/
    └── src/
        ├── pages/       # Pantallas
        ├── components/  # Componentes reutilizables
        └── services/    # Llamadas a la API
```

---

## Instalación

### Requisitos
- Python 3.10+
- Node.js 18+
- PostgreSQL

### Backend

```bash
# Crear entorno virtual
python -m venv .venv
source .venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env con los datos de tu base de datos

# Inicializar base de datos
cd backend
python init_db.py
python create_admin.py

# Correr servidor
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Variables de entorno

```
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/nombre_db
SECRET_KEY=tu_clave_secreta
```

---

## API

La documentación interactiva de la API está disponible en `http://localhost:8000/docs` una vez que el servidor esté corriendo.

---

## Roadmap

### v1 (actual)
- ✅ Mapa de mesas en tiempo real
- ✅ Gestión completa de pedidos
- ✅ ABM de productos con categorías jerárquicas
- ✅ ABM de usuarios con roles
- ✅ Control de insumos y stock
- ✅ Registro de gastos por categoría
- ✅ Autenticación JWT con roles
- ✅ WebSockets para actualización en tiempo real

### v2 (en desarrollo)
- 🔄 Módulo de pagos (efectivo, tarjeta, QR MercadoPago)
- 🔄 División de pagos por productos entre comensales
- 🔄 Historial de pedidos con filtros por fecha
- 🔄 Reportes de ventas y productos más vendidos
- 🔄 Editor visual de plano del salón con drag & drop
- 🔄 Deploy con Docker

---

## Autor

Desarrollado por Juan Cruz González  
[LinkedIn](https://www.linkedin.com/in/juancrgonzalez1/) · [GitHub](https://github.com/Juancruzgon)