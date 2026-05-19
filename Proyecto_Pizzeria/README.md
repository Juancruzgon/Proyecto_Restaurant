# 🍽 Sistema de Gestión Gastronómica

Sistema web completo para la gestión operativa de restaurantes y negocios gastronómicos. Permite administrar mesas, pedidos, productos, insumos, gastos, reportes e impresión de comandas y tickets, todo en tiempo real.

---

## 📸 Capturas de pantalla

| Dashboard | Mapa de mesas |
|-----------|---------------|
| ![Dashboard](docs/screenshots/dashboard.png) | ![Mesas](docs/screenshots/mesas.png) |

| Pantalla de cocina | Reportes |
|--------------------|----------|
| ![Cocina](docs/screenshots/cocina.png) | ![Reportes](docs/screenshots/reportes.png) |

| Configuración |
|---------------|
| ![Configuración](docs/screenshots/configuracion.png) |

---

## 🛠 Stack tecnológico

| Capa | Tecnología |
|------|------------|
| Backend | Python 3.11 · FastAPI · SQLModel |
| Base de datos | PostgreSQL |
| Autenticación | JWT (python-jose) · bcrypt |
| Tiempo real | WebSockets (FastAPI) |
| Impresión | ESC/POS · python-escpos (red TCP/IP) |
| Frontend | React 18 · Vite · React Router v6 |
| HTTP Client | Axios |
| Estilos | Inline styles (sin librerías CSS externas) |

---

## ✨ Funcionalidades

### 🗺 Mesas y salones
- Mapa visual interactivo con estado en tiempo real (libre / ocupada)
- Soporte para múltiples salones con nombre personalizado
- Creación y edición de mesas con número, capacidad y salón asignado
- Indicador de ocupación con actualización automática vía WebSocket

### 📋 Pedidos
- Tipos de pedido: **Salón**, **Takeaway** y **Delivery**
- Flujo de estados: Creado → En cocina → Listo → Pagado
- Agregar, modificar y eliminar productos dentro del pedido
- Cubiertos automáticos por persona (configurable)
- Filtros por estado en la lista de pedidos
- Vista "Todos hoy" para ver el historial del día

### 🛒 Productos y categorías
- Categorías jerárquicas de hasta 3 niveles
- Campos: nombre, precio, descripción, imagen, descuento (%)
- Tipos de stock: **sin receta** (descuenta unidades) o **con receta** (descuenta ingredientes)
- Vinculación de insumos por receta con cantidades por unidad
- Toggle de **producto agotado** (visible en carta pero no se puede agregar)

### 📦 Insumos y stock
- Categorías de insumos con unidad de medida
- Stock actual con ajustes manuales
- **Stock mínimo**: alerta visual en el Dashboard cuando el stock cae por debajo del mínimo configurado
- Descuento automático de stock al confirmar pedidos

### 👨‍🍳 Pantalla de cocina
- Vista dedicada en tiempo real para el equipo de cocina
- Muestra pedidos pendientes con sus productos
- Botón para marcar pedidos como listos
- Activable/desactivable desde Configuración

### 💰 Gastos
- Registro de gastos con categoría, monto, descripción y fecha
- Categorías de gastos con imagen personalizable
- Visible en reportes para calcular ganancia neta

### 📊 Reportes
- Ventas totales del día / semana / mes
- Desglose por producto más vendido
- Gastos del período
- Ganancia neta (ventas − gastos)

### ⚙️ Configuración
- Nombre del local y logo (URL)
- Activar/desactivar pantalla de cocina en el menú
- Impresora de cocina (comanda): IP y puerto TCP
- Impresora de ticket al cliente: IP y puerto TCP
- Cubiertos: activar/desactivar y precio por persona

### 👥 Usuarios y roles
- Roles: **Admin** (acceso total) y **Empleado** (acceso operativo)
- Creación y edición de usuarios
- Autenticación con JWT, sesión persistida en localStorage

### 🖨 Impresión térmica
- Comanda a impresora de cocina al crear/actualizar pedido
- Ticket al cliente al cobrar
- Compatible con impresoras ESC/POS en red (TCP/IP)

### 💳 Caja
- Apertura y cierre de caja desde el sidebar
- Registro de apertura con hora y usuario
- Visible solo para administradores

---

## 🚀 Instalación

### Requisitos previos
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/sistema-gestion-gastronomica.git
cd sistema-gestion-gastronomica
```

### 2. Backend

```bash
# Crear y activar entorno virtual
python -m venv .venv
source .venv/bin/activate        # macOS / Linux
# .venv\Scripts\activate         # Windows

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus datos (ver tabla abajo)

# Iniciar el servidor
uvicorn backend.main:app --reload --port 8000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

La app estará disponible en `http://localhost:5173`.

---

## 🔑 Variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | URL de conexión a PostgreSQL | `postgresql://usuario:pass@localhost:5432/pizzeria_db` |
| `SECRET_KEY` | Clave secreta para firmar JWT | `una_clave_larga_y_aleatoria` |

> **Nota:** La configuración de impresoras (IP, puerto) y los datos del local (nombre, logo) se gestionan desde la pantalla de Configuración dentro de la app, y se guardan en la base de datos. No requieren variables de entorno.

---

## 🗄 Base de datos

Crear la base de datos antes de iniciar el servidor:

```sql
CREATE DATABASE pizzeria_db;
```

SQLModel crea las tablas automáticamente al iniciar el backend (`create_all` en `main.py`).

---

## 📁 Estructura del proyecto

```
sistema-gestion-gastronomica/
├── backend/
│   ├── main.py                  # App FastAPI, CORS, WebSocket, rutas
│   ├── core/
│   │   ├── auth.py              # JWT, bcrypt
│   │   └── database.py          # Conexión SQLModel
│   ├── models/                  # Tablas SQLModel
│   │   ├── usuario.py
│   │   ├── mesa.py
│   │   ├── pedido.py
│   │   ├── producto.py
│   │   ├── insumo.py
│   │   ├── gasto.py
│   │   ├── configuracion.py
│   │   └── ...
│   ├── schemas/                 # Schemas Pydantic (entrada/salida)
│   ├── routers/                 # Endpoints por módulo
│   ├── crud/                    # Lógica de negocio
│   ├── services/                # Lógica de negocio interna
│   └── integrations/
│       └── printer.py           # Impresión ESC/POS
├── frontend/
│   ├── src/
│   │   ├── pages/               # Pantallas principales
│   │   │   ├── Dashboard.jsx
│   │   │   ├── MapaMesas.jsx
│   │   │   ├── NuevoPedido.jsx
│   │   │   ├── Pedido.jsx
│   │   │   ├── Pedidos.jsx
│   │   │   ├── Productos.jsx
│   │   │   ├── Insumos.jsx
│   │   │   ├── Gastos.jsx
│   │   │   ├── Reportes.jsx
│   │   │   ├── PantallaCocina.jsx
│   │   │   ├── Configuracion.jsx
│   │   │   └── ...
│   │   ├── components/
│   │   │   └── Layout.jsx       # Sidebar + navegación
│   │   ├── services/
│   │   │   └── api.js           # Axios, todas las llamadas al backend
│   │   └── App.jsx              # Rutas React Router
│   └── index.html
├── docs/
│   └── screenshots/             # Capturas de pantalla
├── .env
├── requirements.txt
└── README.md
```

---

## 🔐 Roles y permisos

| Módulo | Admin | Empleado |
|--------|-------|----------|
| Dashboard | ✅ | ✅ |
| Pedidos | ✅ | ✅ |
| Mesas | ✅ | ✅ |
| Cocina | ✅ | ✅ |
| Productos | ✅ | ❌ |
| Insumos | ✅ | ❌ |
| Gastos | ✅ | ❌ |
| Usuarios | ✅ | ❌ |
| Reportes | ✅ | ❌ |
| Configuración | ✅ | ❌ |
| Caja | ✅ | ❌ |

---

## 🔜 Próxima versión

- 💳 **Integración con MercadoPago** — pagos online con QR y link de pago
- 🔀 **División de cuenta** — pagar por ítem o por persona
- 📱 **App mobile** — acceso desde celular para mozos
- 🧾 **Controlador fiscal** — emisión de facturas

---

## 📄 Licencia

MIT — libre para uso personal y comercial.
