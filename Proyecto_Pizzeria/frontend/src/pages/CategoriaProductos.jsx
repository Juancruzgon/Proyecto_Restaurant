import { getProductos, crearProducto, getCategorias, crearCategoria, modificarCategoria, eliminarCategoria } from '../services/api'
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

function CategoriaProductos() {
  const [productos, setProductos] = useState([])
  const [subcategorias, setSubcategorias] = useState([])
  const [nombre, setNombre] = useState('')
  const [precio, setPrecio] = useState(0)
  const [descripcion, setDescripcion] = useState('')
  const [nombreCategoria, setNombreCategoria] = useState('')
  const [mostrarFormularioProducto, setMostrarFormularioProducto] = useState(false)
  const [mostrarFormularioCategoria, setMostrarFormularioCategoria] = useState(false)
  const [categoriaEditando, setCategoriaEditando] = useState(null)
  const [nombreEditar, setNombreEditar] = useState('')
  const { categoriaId } = useParams()
  const navigate = useNavigate()

  const cargarDatos = () => {
    getProductos(categoriaId).then(data => setProductos(data))
    getCategorias(categoriaId).then(data => setSubcategorias(data))
  }

  useEffect(() => {
    cargarDatos()
  }, [categoriaId])

  const handleCrearProducto = () => {
    crearProducto(nombre, precio, descripcion, categoriaId).then(() => {
      cargarDatos()
      setNombre(''); setPrecio(0); setDescripcion('')
      setMostrarFormularioProducto(false)
    })
  }

  const handleCrearCategoria = () => {
    crearCategoria(nombreCategoria, '', categoriaId).then(() => {
      cargarDatos()
      setNombreCategoria('')
      setMostrarFormularioCategoria(false)
    })
  }

  const handleEditarCategoria = (categoria) => {
    setCategoriaEditando(categoria.id)
    setNombreEditar(categoria.nombre)
  }

  const handleGuardarCategoria = (categoriaId) => {
    modificarCategoria(categoriaId, { nombre: nombreEditar }).then(() => {
      cargarDatos()
      setCategoriaEditando(null)
      setNombreEditar('')
    })
  }

  const handleEliminarCategoria = (categoriaId) => {
    if (window.confirm('¿Estás seguro que querés eliminar esta categoría?')) {
      eliminarCategoria(categoriaId).then(() => cargarDatos())
    }
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

        {subcategorias.length > 0 && (
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">Subcategorías</h2>
            <div className="flex flex-col gap-3">
              {subcategorias.map(c => (
                <div key={c.id} className="bg-white rounded-xl border border-gray-200 px-4 py-3">
                  {categoriaEditando === c.id ? (
                    <div className="flex gap-2">
                      <input
                        value={nombreEditar}
                        onChange={(e) => setNombreEditar(e.target.value)}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                      />
                      <button onClick={() => handleGuardarCategoria(c.id)} className="bg-orange-500 text-white text-xs px-3 py-1 rounded-lg hover:bg-orange-600">Guardar</button>
                      <button onClick={() => setCategoriaEditando(null)} className="border border-gray-300 text-gray-600 text-xs px-3 py-1 rounded-lg hover:bg-gray-50">Cancelar</button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-700">{c.nombre}</span>
                      <div className="flex gap-2">
                        <button onClick={() => navigate(`/productos/${c.id}`)} className="text-sm text-orange-500 border border-orange-300 px-3 py-1 rounded-lg hover:bg-orange-50 transition">Ver →</button>
                        <button onClick={() => handleEditarCategoria(c)} className="text-sm text-blue-500 border border-blue-300 px-3 py-1 rounded-lg hover:bg-blue-50 transition">Editar</button>
                        <button onClick={() => handleEliminarCategoria(c.id)} className="text-sm text-red-500 border border-red-300 px-3 py-1 rounded-lg hover:bg-red-50 transition">✕</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {productos.length > 0 && (
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase mb-2">Productos</h2>
            <div className="flex flex-col gap-3">
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
          </div>
        )}

        {mostrarFormularioCategoria ? (
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-3">
            <h2 className="font-semibold text-gray-700 mb-3">Nueva subcategoría</h2>
            <input value={nombreCategoria} onChange={(e) => setNombreCategoria(e.target.value)} placeholder="Nombre" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-orange-400" />
            <div className="flex gap-2">
              <button onClick={handleCrearCategoria} className="flex-1 bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition text-sm">Confirmar</button>
              <button onClick={() => setMostrarFormularioCategoria(false)} className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg hover:bg-gray-50 transition text-sm">Cancelar</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setMostrarFormularioCategoria(true)} className="w-full border-2 border-dashed border-blue-200 text-blue-400 py-3 rounded-xl hover:border-blue-400 hover:text-blue-500 transition mb-3">
            + Agregar subcategoría
          </button>
        )}

        {mostrarFormularioProducto ? (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h2 className="font-semibold text-gray-700 mb-3">Nuevo producto</h2>
            <div className="flex flex-col gap-2 mb-3">
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              <input type="number" value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="Precio" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Descripción" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
            <div className="flex gap-2">
              <button onClick={handleCrearProducto} className="flex-1 bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition text-sm">Confirmar</button>
              <button onClick={() => setMostrarFormularioProducto(false)} className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg hover:bg-gray-50 transition text-sm">Cancelar</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setMostrarFormularioProducto(true)} className="w-full border-2 border-dashed border-gray-300 text-gray-400 py-3 rounded-xl hover:border-orange-400 hover:text-orange-400 transition">
            + Agregar producto
          </button>
        )}
      </div>
    </div>
  )
}

export default CategoriaProductos