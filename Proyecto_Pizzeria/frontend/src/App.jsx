import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import MapaMesas from './pages/MapaMesas'
import Pedido from './pages/Pedido'
import Dashboard from './pages/Dashboard'
import Pedidos from './pages/Pedidos'
import NuevoPedido from './pages/NuevoPedido'
import Productos from './pages/Productos'
import CategoriaProductos from './pages/CategoriaProductos'
import ModificarProducto from './pages/ModificarProducto'
import EditarMesa from './pages/EditarMesa'
import CrearMesa from './pages/CrearMesa'
import Usuarios from './pages/Usuarios'
import EditarUsuario from './pages/EditarUsuario'
import Insumos from './pages/Insumos'
import CategoriaInsumos from './pages/CategoriaInsumos'
import EditarInsumo from './pages/EditarInsumo'
import Gastos from './pages/Gastos'
import CategoriaGastos from './pages/CategoriaGastos'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/mesas" element={<MapaMesas />} />
      <Route path="/pedido/:mesaId" element={<Pedido />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/pedidos" element={<Pedidos />} />
      <Route path="/nuevo-pedido" element={<NuevoPedido />} />
      <Route path="/productos" element={<Productos />} />
      <Route path="/productos/:categoriaId" element={<CategoriaProductos />} />
      <Route path="/productos/:categoriaId/:productoId" element={<ModificarProducto />} />
      <Route path="/mesas/:mesaId/editar" element={<EditarMesa />} />
      <Route path="/mesas/nueva" element={<CrearMesa />} />
      <Route path="/usuarios" element={<Usuarios />} />
      <Route path="/usuarios/:usuarioId/editar" element={<EditarUsuario />} />
      <Route path="/insumos/:categoriaId" element={<CategoriaInsumos />} />
      <Route path="/insumos/:categoriaId/:insumoId" element={<EditarInsumo />} />
      <Route path="/insumos" element={<Insumos />} />
      <Route path="/gastos" element={<Gastos />} />
      <Route path="/gastos/:categoriaId" element={<CategoriaGastos />} />
    </Routes>
  )
}

export default App