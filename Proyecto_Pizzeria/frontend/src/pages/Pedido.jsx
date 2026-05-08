import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getPedidosPorMesa, getDetallePedido, getProductos, cambiarEstadoPedido, eliminarDetalle, agregarDetalle, crearPedido, getCategorias } from '../services/api'


function Pedido() {
  const { mesaId } = useParams()
  const [pedido, setPedido] = useState(null)
  const [detalles, setDetalles] = useState([])
  const [productos, setProductos] = useState([])
  const [productoSeleccionado, setProductoSeleccionado] = useState('')
  const [cantidad, setCantidad] = useState(1)
  const [itemsTemp, setItemsTemp] = useState([])
  const navigate = useNavigate()
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
    <div>
      <select value={categoriaSeleccionada} onChange={handleCategoriaChange}>
        <option value="">Seleccionar categoría</option>
        {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
      </select>

      {subcategorias.length > 0 && (
        <select value={subcategoriaSeleccionada} onChange={handleSubcategoriaChange}>
          <option value="">Seleccionar subcategoría</option>
          {subcategorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
      )}

      {subsubcategorias.length > 0 && (
        <select value={subsubcategoriaSeleccionada} onChange={(e) => { setSubsubcategoriaSeleccionada(e.target.value); setProductoSeleccionado('') }}>
          <option value="">Seleccionar subcategoría</option>
          {subsubcategorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
      )}

      <select value={productoSeleccionado} onChange={(e) => setProductoSeleccionado(e.target.value)}>
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

  return (
    <div>
      <button onClick={() => navigate(-1)}>← Volver</button>
      <button onClick={() => navigate('/dashboard')}>Inicio</button>
      <h1>Mesa {mesaId}</h1>
      {pedido ? (
        <div>
          <p>Pedido #{pedido.nro_pedido}</p>
          <p>Total: ${pedido.total}</p>

          <h2>Productos:</h2>
          {detalles.map(d => {
            const producto = productos.find(p => p.id === d.producto_id)
            return (
              <div key={d.id}>
                {d.cantidad}x {producto?.nombre || 'Cargando...'} - ${d.subtotal}
                <button onClick={() => eliminarDetalle(pedido.id, d.id).then(() => cargarDatos())}>
                  Eliminar
                </button>
              </div>
            )
          })}

          <h2>Agregar producto</h2>
          {selectores}
          <input type="number" value={cantidad} onChange={(e) => setCantidad(e.target.value)} min="1" />
          <button onClick={() => agregarDetalle(pedido.id, productoSeleccionado, cantidad).then(() => cargarDatos())}>
            Agregar
          </button>

          <br /><br />
          <button onClick={() => cambiarEstadoPedido(pedido.id).then(() => cargarDatos())}>
            Avanzar estado
          </button>
        </div>
      ) : (
        <div>
          <h2>Nuevo pedido</h2>
          {selectores}
          <input type="number" value={cantidad} onChange={(e) => setCantidad(e.target.value)} min="1" />
          <button onClick={handleAgregarTemp}>Agregar</button>

          <h3>Productos seleccionados:</h3>
          {itemsTemp.map((item, i) => (
            <div key={i}>
              {item.cantidad}x {item.nombre} - ${item.precio * item.cantidad}
              <button onClick={() => setItemsTemp(itemsTemp.filter((_, index) => index !== i))}>
                Eliminar
              </button>
            </div>
          ))}
          {itemsTemp.length > 0 && (
            <button onClick={handleCrearPedido}>Crear pedido</button>
          )}
        </div>
      )}
    </div>
  )
}

export default Pedido