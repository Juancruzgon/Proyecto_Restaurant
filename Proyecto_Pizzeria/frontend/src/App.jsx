import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
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
import PantallaCocina from './pages/PantallaCocina'

function W({ children }) {
  return <Layout>{children}</Layout>
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route path="/dashboard"                              element={<W><Dashboard /></W>} />
      <Route path="/mesas"                                  element={<W><MapaMesas /></W>} />
      <Route path="/mesas/nueva"                            element={<W><CrearMesa /></W>} />
      <Route path="/mesas/:mesaId/editar"                   element={<W><EditarMesa /></W>} />
      <Route path="/pedidos"                                element={<W><Pedidos /></W>} />
      <Route path="/nuevo-pedido"                           element={<W><NuevoPedido /></W>} />

      {/* Salón: con mesaId */}
      <Route path="/pedido/:mesaId"                         element={<W><Pedido /></W>} />
      {/* Takeaway / Delivery: sin mesaId */}
      <Route path="/pedido/nuevo"                           element={<W><Pedido /></W>} />

      <Route path="/productos"                              element={<W><Productos /></W>} />
      <Route path="/productos/:categoriaId"                 element={<W><CategoriaProductos /></W>} />
      <Route path="/productos/:categoriaId/:productoId"     element={<W><ModificarProducto /></W>} />
      <Route path="/usuarios"                               element={<W><Usuarios /></W>} />
      <Route path="/usuarios/:usuarioId/editar"             element={<W><EditarUsuario /></W>} />
      <Route path="/insumos"                                element={<W><Insumos /></W>} />
      <Route path="/insumos/:categoriaId"                   element={<W><CategoriaInsumos /></W>} />
      <Route path="/insumos/:categoriaId/:insumoId"         element={<W><EditarInsumo /></W>} />
      <Route path="/gastos"                                 element={<W><Gastos /></W>} />
      <Route path="/gastos/:categoriaId"                    element={<W><CategoriaGastos /></W>} />
      <Route path="/cocina" element={<PantallaCocina />} />

    </Routes>
  )
}

export default App
