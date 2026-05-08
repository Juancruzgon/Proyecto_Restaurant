import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getInsumo, modificarInsumo, eliminarInsumo, getCategoriasInsumo } from '../services/api'

function EditarInsumo() {
  const { categoriaId, insumoId } = useParams()
  const navigate = useNavigate()
  const [insumo, setInsumo] = useState(null)
  const [nombre, setNombre] = useState('')
  const [precio, setPrecio] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [categorias, setCategorias] = useState([])
  const [categoriaId2, setCategoriaId2] = useState('')

  useEffect(() => {
    getInsumo(insumoId).then(data => {
      setInsumo(data)
      setNombre(data.nombre)
      setPrecio(data.precio)
      setDescripcion(data.descripcion || '')
      setCategoriaId2(data.categoria_id)
    })
    getCategoriasInsumo().then(data => setCategorias(data))
  }, [insumoId])

  const handleGuardar = () => {
    const datos = {}
    if (nombre) datos.nombre = nombre
    if (precio) datos.precio = parseFloat(precio)
    if (descripcion) datos.descripcion = descripcion
    if (categoriaId2) datos.categoria_id = parseInt(categoriaId2)
    modificarInsumo(insumoId, datos).then(() => navigate(`/insumos/${categoriaId}`))
  }

  const handleEliminar = () => {
    if (window.confirm('¿Estás seguro que querés eliminar este insumo?')) {
      eliminarInsumo(insumoId).then(() => navigate(`/insumos/${categoriaId}`))
    }
  }

  if (!insumo) return <div className="flex items-center justify-center min-h-screen text-gray-500">Cargando...</div>

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold !text-orange-500">Editar Insumo</h1>
        <div className="flex gap-2">
          <button onClick={() => navigate(-1)} className="text-sm text-gray-500 border border-gray-300 px-3 py-1 rounded-lg hover:bg-gray-50 transition">← Volver</button>
          <button onClick={() => navigate('/dashboard')} className="text-sm text-gray-500 border border-gray-300 px-3 py-1 rounded-lg hover:bg-gray-50 transition">Inicio</button>
        </div>
      </div>

      <div className="max-w-sm mx-auto mt-8 px-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Nombre</label>
              <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Precio</label>
              <input type="number" value={precio} onChange={(e) => setPrecio(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Descripción</label>
              <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Categoría</label>
              <select value={categoriaId2} onChange={(e) => setCategoriaId2(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                <option value="">Seleccionar categoría</option>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <button onClick={handleGuardar} className="w-full bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition">
              Guardar cambios
            </button>
          </div>
          <button onClick={handleEliminar} className="w-full mt-3 border border-red-300 text-red-500 py-2 rounded-lg hover:bg-red-50 transition text-sm">
            Eliminar insumo
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditarInsumo