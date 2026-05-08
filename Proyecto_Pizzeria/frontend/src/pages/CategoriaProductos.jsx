import { getProductos, crearProducto } from '../services/api'
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

function CategoriaProductos() {
  const [productos, setProductos] = useState([])
  const [nombre, setNombre] = useState('')
  const [precio, setPrecio] = useState(0)
  const [descripcion, setDescripcion] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const { categoriaId } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    getProductos(categoriaId).then(data => setProductos(data))
  }, [categoriaId])

  const handleCrearProducto = () => {
    crearProducto(nombre, precio, descripcion, categoriaId).then(() => {
      getProductos(categoriaId).then(data => setProductos(data))
      setNombre(''); setPrecio(0); setDescripcion('')
      setMostrarFormulario(false)
    })
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold !text-orange-500">Productos</h1>
        <div className="flex gap-2">
          <button onClick={() => navigate(-1)} className="text-sm text-gray-500 border border-gray-300 px-3 py-1 rounded-lg hover:bg-gray-50 transition">← Volver</button>
          <button onClick={() => navigate('/dashboard')} className="text-sm text-gray-500 border border-gray-300 px-3 py-1 rounded-lg hover:bg-gray-50 transition">Inicio</button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto mt-6 px-4">
        <div className="flex flex-col gap-3 mb-4">
          {productos.map(producto => (
            <div key={producto.id} className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-700">{producto.nombre}</p>
                <p className="text-sm text-gray-500">${producto.precio}</p>
              </div>
              <button
                onClick={() => navigate(`/productos/${categoriaId}/${producto.id}`)}
                className="text-sm text-orange-500 border border-orange-300 px-3 py-1 rounded-lg hover:bg-orange-50 transition"
              >
                Modificar
              </button>
            </div>
          ))}
        </div>

        {mostrarFormulario ? (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h2 className="font-semibold text-gray-700 mb-3">Nuevo producto</h2>
            <div className="flex flex-col gap-2 mb-3">
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              <input type="number" value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="Precio" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Descripción" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
            <div className="flex gap-2">
              <button onClick={handleCrearProducto} className="flex-1 bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition text-sm">Confirmar</button>
              <button onClick={() => setMostrarFormulario(false)} className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg hover:bg-gray-50 transition text-sm">Cancelar</button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setMostrarFormulario(true)}
            className="w-full border-2 border-dashed border-gray-300 text-gray-400 py-3 rounded-xl hover:border-orange-400 hover:text-orange-400 transition"
          >
            + Agregar producto
          </button>
        )}
      </div>
    </div>
  )
}

export default CategoriaProductos