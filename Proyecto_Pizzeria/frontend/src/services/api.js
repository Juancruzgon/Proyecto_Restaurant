import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000'
})
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api

export const login = async (email, password) => {
  const formData = new FormData()
  formData.append('username', email)
  formData.append('password', password)
  
  const response = await api.post('/login', formData)
  return response.data
}

export const getMesas = async (salonId = null) => {
  const url = salonId ? `/mesas/?salon_id=${salonId}` : '/mesas/'
  const response = await api.get(url)
  return response.data
 
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

export const getPedidosPorMesa = async (mesaId) => {
  const response = await api.get(`/pedidos/?mesa_id=${mesaId}`)
  return response.data
}

export const getDetallePedido = async (pedidoId) => {
  const response = await api.get(`/pedidos/${pedidoId}/detalle`)
  return response.data
}

export const getProductos = async (categoriaId = null) => {
  const url = categoriaId ? `/productos/?categoria_id=${categoriaId}` : '/productos/'
  const response = await api.get(url)
  return response.data
}


export const getProductoPorId = async (productoId) => {
  const response = await api.get(`/productos/${productoId}`)
  return response.data
}

export const modificarProducto = async (productoId, data) => {
  const response = await api.put(`/productos/${productoId}`, data)
  return response.data
  
}

export const crearProducto = async (nombre, precio, descripcion, categoriaId) => {
  const response = await api.post('/productos/', {
    nombre,
    precio: parseFloat(precio),
    descripcion,
    categoria_id: parseInt(categoriaId)
  })
  return response.data
}

export const eliminarProducto = async (productoId) => {
  const response = await api.delete(`/productos/${productoId}`)
  return response.data
}

export const cambiarEstadoPedido = async (pedidoId) => {
  const response = await api.put(`/pedidos/${pedidoId}/estado`)
  return response.data
}

export const eliminarDetalle = async (pedidoId, detalleId) => {
  const response = await api.delete(`/pedidos/${pedidoId}/detalle/${detalleId}`)
  return response.data
}

export const modificarCantidad = async (pedidoId, detalleId, cantidad) => {
  const response = await api.put(`/pedidos/${pedidoId}/detalle/${detalleId}?cantidad=${cantidad}`)
  return response.data
}

export const agregarDetalle = async (pedidoId, productoId, cantidad, nota = null) => {
  const response = await api.post(`/pedidos/${pedidoId}/detalle`, {
    producto_id: productoId,
    cantidad,
    ...(nota ? { nota } : {}),
  })
  return response.data
}

export const modificarNota = async (pedidoId, detalleId, nota) => {
  const response = await api.put(`/pedidos/${pedidoId}/detalle/${detalleId}/nota`, { nota: nota || null })
  return response.data
}

export const crearPedido = async (mesaId, usuarioId, tipoPedido) => {
  const response = await api.post('/pedidos/', {
    mesa_id: parseInt(mesaId),
    usuario_id: parseInt(usuarioId),
    tipo_pedido: tipoPedido
  })
  return response.data

  
}

export const getPedidos = async (params = {}) => {
  const query = new URLSearchParams()
  if (params.caja_id) query.append('caja_id', params.caja_id)
  if (params.pagados) query.append('pagados', 'true')
  const url = `/pedidos/${query.toString() ? '?' + query.toString() : ''}`
  const response = await api.get(url)
  return response.data
}

export const getCategorias = async (parentId = null) => {
  const url = parentId ? `/categorias-productos/?parent_id=${parentId}` : '/categorias-productos/'
  const response = await api.get(url)
  return response.data
}

export const crearCategoria = async (nombre, descripcion, parentId = null) => {
  const response = await api.post('/categorias-productos/', { nombre, descripcion, parent_id: parentId })
  return response.data
}

export const getSalones = async () => {
  const response = await api.get('/salones/')
  return response.data
}
export const eliminarMesa = async (mesaId) => {
  const response = await api.delete(`/mesas/${mesaId}`)
  return response.data
}

export const getMesaPorId = async (mesaId) => {
  const response = await api.get(`/mesas/${mesaId}`)
  return response.data
}

export const modificarMesa = async (mesaId, data) => {
  const response = await api.put(`/mesas/${mesaId}`, data)
  return response.data
}

export const crearMesa = async (data) => {
  const response = await api.post('/mesas/', data)
  return response.data
}
export const getUsuarios = async () => {
  const response = await api.get('/usuarios/')
  return response.data
}

export const getRoles = async () => {
  const response = await api.get('/roles/')
  return response.data
}

export const crearUsuario = async (data) => {
  const response = await api.post('/usuarios/', data)
  return response.data
}
export const getUsuarioPorId = async (usuarioId) => {
  const response = await api.get(`/usuarios/${usuarioId}`)
  return response.data
}

export const modificarUsuario = async (usuarioId, data) => {
  const response = await api.put(`/usuarios/${usuarioId}`, data)
  return response.data
}

export const desactivarUsuario = async (usuarioId) => {
  const response = await api.delete(`/usuarios/${usuarioId}`)
  return response.data
}

export const getCategoriasInsumo = async (parentId = null) => {
  const url = parentId ? `/categorias-insumos/?parent_id=${parentId}` : '/categorias-insumos/'
  const response = await api.get(url)
  return response.data
}

export const crearCategoriaInsumo = async (data) => {
  const response = await api.post('/categorias-insumos/', data)
  return response.data
}

export const agregarCategoriaInsumo = async (data) => {
  const response = await api.post('/categorias-insumos/', data)
  return response.data
}

export const modificarInsumo = async (insumoId, data) => {
  const response = await api.put(`/insumos/${insumoId}`, data)
  return response.data
}

export const eliminarInsumo = async (insumoId) => {
  const response = await api.delete(`/insumos/${insumoId}`)
  return response.data
}

export const getInsumo = async (categoriaId = null) => {
  const url = categoriaId ? `/insumos/?categoria_id=${categoriaId}` : '/insumos/'
  const response = await api.get(url)
  return response.data
}

export const crearInsumo = async (data) => {
  const response = await api.post('/insumos/', data)
  return response.data
}
export const getCategoriasGasto = async () => {
  const response = await api.get('/categorias-gastos/')
  return response.data
}

export const getGastos = async (categoriaId = null) => {
  const url = categoriaId ? `/gastos/?categoria_id=${categoriaId}` : '/gastos/'
  const response = await api.get(url)
  return response.data
}

export const crearGasto = async (data) => {
  const response = await api.post('/gastos/', data)
  return response.data
}

export const crearCategoriaGasto = async (data) => {
  const response = await api.post('/categorias-gastos/', data)
  return response.data
}

export const eliminarPedido = async (pedidoId) => {
  const response = await api.delete(`/pedidos/${pedidoId}`)
  return response.data
}

export const modificarCategoria = async (categoriaId, data) => {
  const response = await api.put(`/categorias-productos/${categoriaId}`, data)
  return response.data
}

export const eliminarCategoria = async (categoriaId) => {
  const response = await api.delete(`/categorias-productos/${categoriaId}`)
  return response.data
}
export const imprimirComanda = async (pedidoId) => {
  const response = await api.post(`/pedidos/${pedidoId}/imprimir-comanda`)
  return response.data
}

export const imprimirTicket = async (pedidoId) => {
  const response = await api.post(`/pedidos/${pedidoId}/imprimir-ticket`)
  return response.data
}
export const getReceta = async (productoId) => {
  const response = await api.get(`/recetas/producto/${productoId}`)
  return response.data
}

export const agregarIngrediente = async (data) => {
  const response = await api.post('/recetas/', data)
  return response.data
}

export const modificarIngrediente = async (recetaId, data) => {
  const response = await api.put(`/recetas/${recetaId}`, data)
  return response.data
}

export const eliminarIngrediente = async (recetaId) => {
  const response = await api.delete(`/recetas/${recetaId}`)
  return response.data
}

export const getInsumos = async () => {
  const response = await api.get('/insumos/')
  return response.data
}
export const agregarCompra = async (insumoId, cantidad, monto) => {
  const response = await api.post(`/insumos/${insumoId}/compra`, { cantidad, monto })
  return response.data
}
export const getCajaActiva = async () => {
  const response = await api.get('/caja/activa')
  return response.data
}

export const abrirCaja = async () => {
  const response = await api.post('/caja/abrir')
  return response.data
}

export const cerrarCaja = async () => {
  const response = await api.put('/caja/cerrar')
  return response.data
}

export const getReporteProducto = async (productoId, desde, hasta) => {
  const response = await api.get(`/reportes/producto/${productoId}?desde=${desde}&hasta=${hasta}`)
  return response.data
}

export const getReporteComparar = async (desde1, hasta1, desde2, hasta2) => {
  const response = await api.get(`/reportes/comparar?desde1=${desde1}&hasta1=${hasta1}&desde2=${desde2}&hasta2=${hasta2}`)
  return response.data
}

export const cobrarPedido = async (pedidoId, pagos) => {
  const response = await api.put(`/pedidos/${pedidoId}/cobrar`, { pagos })
  return response.data
}
export const getPagosParciales = async (pedidoId) => {
  const response = await api.get(`/pagos-parciales/pedido/${pedidoId}`)
  return response.data
}

export const registrarPagoParcial = async (pedidoId, items) => {
  const response = await api.post(`/pagos-parciales/pedido/${pedidoId}`, { items })
  return response.data
}
export const getHistorialCajas = async () => {
  const response = await api.get('/reportes/cajas')
  return response.data
}

export const getReporteVentas = async (desde, hasta, cajaId = null) => {
  const params = cajaId ? `?desde=${desde}&hasta=${hasta}&caja_id=${cajaId}` : `?desde=${desde}&hasta=${hasta}`
  const response = await api.get(`/reportes/ventas${params}`)
  return response.data
}
export const getInsumoById = async (insumoId) => {
  const response = await api.get(`/insumos/${insumoId}`)
  return response.data
}