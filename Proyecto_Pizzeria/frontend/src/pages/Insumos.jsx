import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCategoriasInsumo, crearCategoriaInsumo } from '../services/api'

function Insumos() {
  const [categorias, setCategorias] = useState([])
  const [nombreCategoria, setNombreCategoria] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    getCategoriasInsumo().then(data => setCategorias(data))
  }, [])

  const handleCrearCategoria = () => {
    crearCategoriaInsumo({ nombre: nombreCategoria }).then(() => {
      getCategoriasInsumo().then(data => setCategorias(data))
      setNombreCategoria('')
      setMostrarFormulario(false)
    })
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold !text-orange-500">Insumos</h1>
        <div className="flex gap-2">
          <button onClick={() => navigate(-1)} className="text-sm text-gray-500 border border-gray-300 px-3 py-1 rounded-lg hover:bg-gray-50 transition">← Volver</button>
          <button onClick={() => navigate('/dashboard')} className="text-sm text-gray-500 border border-gray-300 px-3 py-1 rounded-lg hover:bg-gray-50 transition">Inicio</button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto mt-6 px-4">
        <div className="flex flex-col gap-3 mb-4">
          {categorias.map(c => (
            <div key={c.id} className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center justify-between">
              <span className="font-semibold text-gray-700">{c.nombre}</span>
              <button
                onClick={() => navigate(`/insumos/${c.id}`)}
                className="text-sm text-orange-500 border border-orange-300 px-3 py-1 rounded-lg hover:bg-orange-50 transition"
              >
                Ver →
              </button>
            </div>
          ))}
        </div>

        {mostrarFormulario ? (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h2 className="font-semibold text-gray-700 mb-3">Nueva categoría</h2>
            <input
              value={nombreCategoria}
              onChange={(e) => setNombreCategoria(e.target.value)}
              placeholder="Nombre de la categoría"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <div className="flex gap-2">
              <button onClick={handleCrearCategoria} className="flex-1 bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition text-sm">Confirmar</button>
              <button onClick={() => setMostrarFormulario(false)} className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg hover:bg-gray-50 transition text-sm">Cancelar</button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setMostrarFormulario(true)}
            className="w-full border-2 border-dashed border-gray-300 text-gray-400 py-3 rounded-xl hover:border-orange-400 hover:text-orange-400 transition"
          >
            + Agregar categoría
          </button>
        )}
      </div>
    </div>
  )
}

export default Insumos