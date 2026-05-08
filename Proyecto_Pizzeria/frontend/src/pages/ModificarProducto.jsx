import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getProductoPorId, modificarProducto, eliminarProducto } from '../services/api'

function ModificarProducto() {
  const [producto, setProducto] = useState(null)
  const [nombre, setNombre] = useState('')
  const [precio, setPrecio] = useState(0)
  const navigate = useNavigate()
  const { productoId } = useParams()

  useEffect(() => {
    getProductoPorId(productoId).then(data => {
      setProducto(data)
      setNombre(data.nombre)
      setPrecio(data.precio)
    })
  }, [productoId])

  const handleSubmit = (e) => {
    e.preventDefault()
    modificarProducto(productoId, { nombre, precio }).then(() => {
      navigate(`/productos/${producto.categoria_id}`)
    })
  }

  const handleEliminar = () => {
    if (window.confirm('¿Estás seguro que querés eliminar este producto?')) {
      eliminarProducto(productoId).then(() => {
        navigate(`/productos/${producto.categoria_id}`)
      })
    }
  }

  if (!producto) return <div className="flex items-center justify-center min-h-screen text-gray-500">Cargando...</div>

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold !text-orange-500">Modificar Producto</h1>
        <div className="flex gap-2">
          <button onClick={() => navigate(-1)} className="text-sm text-gray-500 border border-gray-300 px-3 py-1 rounded-lg hover:bg-gray-50 transition">← Volver</button>
          <button onClick={() => navigate('/dashboard')} className="text-sm text-gray-500 border border-gray-300 px-3 py-1 rounded-lg hover:bg-gray-50 transition">Inicio</button>
        </div>
      </div>

      <div className="max-w-sm mx-auto mt-8 px-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Nombre</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Precio</label>
              <input
                type="number"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <button type="submit" className="w-full bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition">
              Guardar cambios
            </button>
          </form>
          <button
            onClick={handleEliminar}
            className="w-full mt-3 border border-red-300 text-red-500 py-2 rounded-lg hover:bg-red-50 transition text-sm"
          >
            Eliminar producto
          </button>
        </div>
      </div>
    </div>
  )
}

export default ModificarProducto