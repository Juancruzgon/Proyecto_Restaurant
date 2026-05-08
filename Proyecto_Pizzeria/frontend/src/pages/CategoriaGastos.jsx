import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getGastos, crearGasto } from '../services/api'

function CategoriaGastos() {
  const [gastos, setGastos] = useState([])
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [monto, setMonto] = useState('')
  const { categoriaId } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    getGastos(categoriaId).then(data => setGastos(data))
  }, [categoriaId])

  const handleCrearGasto = () => {
    crearGasto({
      nombre,
      descripcion,
      monto: parseFloat(monto),
      categoria_id: parseInt(categoriaId)
    }).then(() => {
      getGastos(categoriaId).then(data => setGastos(data))
      setNombre(''); setDescripcion(''); setMonto('')
      setMostrarFormulario(false)
    })
  }

  const total = gastos.reduce((acc, g) => acc + parseFloat(g.monto), 0)

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold !text-orange-500">Gastos</h1>
        <div className="flex gap-2">
          <button onClick={() => navigate(-1)} className="text-sm text-gray-500 border border-gray-300 px-3 py-1 rounded-lg hover:bg-gray-50 transition">← Volver</button>
          <button onClick={() => navigate('/dashboard')} className="text-sm text-gray-500 border border-gray-300 px-3 py-1 rounded-lg hover:bg-gray-50 transition">Inicio</button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto mt-6 px-4">
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 mb-4 flex items-center justify-between">
          <span className="text-gray-600 font-medium">Total</span>
          <span className="text-lg font-bold text-red-600">-${total.toFixed(2)}</span>
        </div>

        <div className="flex flex-col gap-3 mb-4">
          {gastos.map(g => (
            <div key={g.id} className="bg-white rounded-xl border border-gray-200 px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-700">{g.nombre}</span>
                <span className="font-bold text-red-500">-${g.monto}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">{g.fecha}</p>
            </div>
          ))}
        </div>

        {mostrarFormulario ? (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h2 className="font-semibold text-gray-700 mb-3">Nuevo gasto</h2>
            <div className="flex flex-col gap-2 mb-3">
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              <input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Descripción" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              <input type="number" value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="Monto" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
            <div className="flex gap-2">
              <button onClick={handleCrearGasto} className="flex-1 bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition text-sm">Confirmar</button>
              <button onClick={() => setMostrarFormulario(false)} className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg hover:bg-gray-50 transition text-sm">Cancelar</button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setMostrarFormulario(true)}
            className="w-full border-2 border-dashed border-gray-300 text-gray-400 py-3 rounded-xl hover:border-orange-400 hover:text-orange-400 transition"
          >
            + Agregar gasto
          </button>
        )}
      </div>
    </div>
  )
}

export default CategoriaGastos