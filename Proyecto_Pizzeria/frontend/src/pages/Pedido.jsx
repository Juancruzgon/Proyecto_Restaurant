import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getPedidosPorMesa, getDetallePedido, getProductos, cambiarEstadoPedido, eliminarDetalle, agregarDetalle, crearPedido, getCategorias } from '../services/api'

function Pedido() {
  const { mesaId } = useParams()
  const navigate = useNavigate()
  const [pedido, setPedido] = useState(null)
  const [detalles, setDetalles] = useState([])
  const [productos, setProductos] = useState([])
  const [productoSeleccionado, setProductoSeleccionado] = useState('')
  const [cantidad, setCantidad] = useState(1)
  const [itemsTemp, setItemsTemp] = useState([])
  const [categorias, setCategorias] = useState([])
  const [subcategorias, setSubcategorias] = useState([])
  const [subsubcategorias, setSubsubcategorias] = useState([])
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('')
  const [subcategoriaSeleccionada, setSubcategoriaSeleccionada] = useState('')
  const [subsubcategoriaSeleccionada, setSubsubcategoriaSeleccionada] = useState('')

  const cargarDatos = () => {
    getPedidosPorMesa(mesaId).then(data => {
      if (data.length > 0) {
        setPedido(data[0])
        getDetallePedido(data[0].id).then(d => setDetalles(d))
      } else {
        setPedido(null)
        setDetalles([])
      }
    })
  }

  useEffect(() => {
    getCategorias().then(data => setCategorias(data))
    getProductos().then(data => setProductos(data))
    cargarDatos()

    const ws = new WebSocket('ws://localhost:8000/ws')
    ws.onmessage = () => cargarDatos()

    return () => ws.close()
  }, [mesaId])

  const handleCategoriaChange = (e) => {
    setCategoriaSeleccionada(e.target.value)
    setSubcategoriaSeleccionada('')
    setSubsubcategoriaSeleccionada('')
    setProductoSeleccionado('')
    setSubsubcategorias([])
    if (e.target.value) {
      getCategorias(e.target.value).then(data => setSubcategorias(data))
    } else {
      setSubcategorias([])
    }
  }

  const handleSubcategoriaChange = (e) => {
    setSubcategoriaSeleccionada(e.target.value)
    setSubsubcategoriaSeleccionada('')
    setProductoSeleccionado('')
    if (e.target.value) {
      getCategorias(e.target.value).then(data => setSubsubcategorias(data))
    } else {
      setSubsubcategorias([])
    }
  }

  const categoriaFinal = subsubcategoriaSeleccionada || subcategoriaSeleccionada || categoriaSeleccionada
  const productosFiltrados = categoriaFinal
    ? productos.filter(p => p.categoria_id === parseInt(categoriaFinal))
    : productos

  const selectores = (
    <div className="flex flex-col gap-2">
      <select value={categoriaSeleccionada} onChange={handleCategoriaChange} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
        <option value="">Seleccionar categoría</option>
        {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
      </select>
      {subcategorias.length > 0 && (
        <select value={subcategoriaSeleccionada} onChange={handleSubcategoriaChange} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
          <option value="">Seleccionar subcategoría</option>
          {subcategorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
      )}
      {subsubcategorias.length > 0 && (
        <select value={subsubcategoriaSeleccionada} onChange={(e) => { setSubsubcategoriaSeleccionada(e.target.value); setProductoSeleccionado('') }} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
          <option value="">Seleccionar subcategoría</option>
          {subsubcategorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
      )}
      <select value={productoSeleccionado} onChange={(e) => setProductoSeleccionado(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
        <option value="">Seleccionar producto</option>
        {productosFiltrados.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
      </select>
    </div>
  )

  const handleAgregarTemp = () => {
    const producto = productos.find(p => p.id === parseInt(productoSeleccionado))
    if (!producto) return
    setItemsTemp([...itemsTemp, {
      producto_id: parseInt(productoSeleccionado),
      cantidad: parseInt(cantidad),
      nombre: producto.nombre,
      precio: producto.precio
    }])
    setProductoSeleccionado('')
    setCantidad(1)
  }

  const handleCrearPedido = () => {
    const usuarioId = localStorage.getItem('usuario_id')
    crearPedido(mesaId, usuarioId, 'Salon').then(nuevoPedido => {
      Promise.all(itemsTemp.map(item =>
        agregarDetalle(nuevoPedido.id, item.producto_id, item.cantidad)
      )).then(() => {
        setItemsTemp([])
        cargarDatos()
      })
    })
  }

  const getEstadoLabel = (estadoId) => {
    const estados = { 1: 'Creado', 2: 'En preparación', 3: 'Listo', 4: 'Pagado' }
    return estados[estadoId] || ''
  }

  const getEstadoColor = (estadoId) => {
    const colores = { 1: 'bg-blue-100 text-blue-800', 2: 'bg-yellow-100 text-yellow-800', 3: 'bg-green-100 text-green-800', 4: 'bg-gray-100 text-gray-800' }
    return colores[estadoId] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold !text-orange-500">Mesa {mesaId}</h1>
        <div className="flex gap-2">
          <button onClick={() => navigate(-1)} className="text-sm text-gray-500 border border-gray-300 px-3 py-1 rounded-lg hover:bg-gray-50 transition">← Volver</button>
          <button onClick={() => navigate('/dashboard')} className="text-sm text-gray-500 border border-gray-300 px-3 py-1 rounded-lg hover:bg-gray-50 transition">Inicio</button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto mt-6 px-4">
        {pedido ? (
          <div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800">Pedido #{pedido.nro_pedido}</p>
                <p className="text-lg font-bold text-gray-800">Total: ${pedido.total}</p>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getEstadoColor(pedido.estado_id)}`}>
                {getEstadoLabel(pedido.estado_id)}
              </span>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
              <h2 className="font-semibold text-gray-700 mb-3">Productos</h2>
              <div className="flex flex-col gap-2">
                {detalles.map(d => {
                  const producto = productos.find(p => p.id === d.producto_id)
                  return (
                    <div key={d.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <span className="text-gray-700">{d.cantidad}x {producto?.nombre || 'Cargando...'}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 font-medium">${d.subtotal}</span>
                        <button
                          onClick={() => eliminarDetalle(pedido.id, d.id).then(() => cargarDatos())}
                          className="text-red-400 hover:text-red-600 text-sm px-2 py-1 rounded"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
              <h2 className="font-semibold text-gray-700 mb-3">Agregar producto</h2>
              {selectores}
              <div className="flex gap-2 mt-3">
                <input type="number" value={cantidad} onChange={(e) => setCantidad(e.target.value)} min="1" className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                <button onClick={() => agregarDetalle(pedido.id, productoSeleccionado, cantidad).then(() => cargarDatos())} className="flex-1 bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition text-sm">
                  Agregar
                </button>
              </div>
            </div>

            <button
              onClick={() => cambiarEstadoPedido(pedido.id).then(() => cargarDatos())}
              className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600 transition"
            >
              Avanzar estado →
            </button>
          </div>
        ) : (
          <div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
              <h2 className="font-semibold text-gray-700 mb-3">Nuevo pedido</h2>
              {selectores}
              <div className="flex gap-2 mt-3">
                <input type="number" value={cantidad} onChange={(e) => setCantidad(e.target.value)} min="1" className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                <button onClick={handleAgregarTemp} className="flex-1 bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition text-sm">
                  Agregar
                </button>
              </div>
            </div>

            {itemsTemp.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
                <h3 className="font-semibold text-gray-700 mb-3">Productos seleccionados</h3>
                {itemsTemp.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <span className="text-gray-700">{item.cantidad}x {item.nombre}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 font-medium">${item.precio * item.cantidad}</span>
                      <button onClick={() => setItemsTemp(itemsTemp.filter((_, index) => index !== i))} className="text-red-400 hover:text-red-600 text-sm px-2 py-1 rounded">✕</button>
                    </div>
                  </div>
                ))}
                <button onClick={handleCrearPedido} className="w-full mt-3 bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600 transition">
                  Crear pedido
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Pedido