import { useState, useEffect } from 'react'
import { getMesas, eliminarMesa } from '../services/api'
import { useNavigate, useSearchParams } from 'react-router-dom'

function MapaMesas() {
  const [searchParams] = useSearchParams()
  const modoNuevo = searchParams.get('modo') === 'nuevo'
  const salonId = searchParams.get('salon_id')
  const [mesas, setMesas] = useState([])
  const [mesaHover, setMesaHover] = useState(null)
  const navigate = useNavigate()
  const rolId = localStorage.getItem('rol_id')

  useEffect(() => {
    getMesas(salonId).then(data => setMesas(data))

    const ws = new WebSocket('ws://localhost:8000/ws')
    ws.onmessage = () => {
      getMesas(salonId).then(data => setMesas(data))
    }

    return () => ws.close()
  }, [salonId])

  const handleEliminarMesa = (e, mesaId) => {
    e.stopPropagation()
    if (window.confirm('¿Estás seguro que querés eliminar esta mesa?')) {
      eliminarMesa(mesaId).then(() => getMesas(salonId).then(data => setMesas(data)))
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold !text-orange-500">Mapa de Mesas</h1>
        <div className="flex gap-2">
          <button onClick={() => navigate(-1)} className="text-sm text-gray-500 border border-gray-300 px-3 py-1 rounded-lg hover:bg-gray-50 transition">← Volver</button>
          <button onClick={() => navigate('/dashboard')} className="text-sm text-gray-500 border border-gray-300 px-3 py-1 rounded-lg hover:bg-gray-50 transition">Inicio</button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-8 px-4">
        <div className="flex flex-wrap gap-4">
          {mesas.map(mesa => (
            <div
              key={mesa.id}
              onMouseEnter={() => setMesaHover(mesa.id)}
              onMouseLeave={() => setMesaHover(null)}
              onClick={() => {
                if (modoNuevo && mesa.estado_id !== 1) {
                  alert('Mesa ocupada - elegí otra mesa')
                } else {
                  navigate(`/pedido/${mesa.id}`)
                }
              }}
              className={`relative w-24 h-24 rounded-xl flex flex-col items-center justify-center cursor-pointer transition shadow-sm ${mesa.estado_id === 1 ? 'bg-green-100 border-2 border-green-400 text-green-800' : 'bg-red-100 border-2 border-red-400 text-red-800'}`}
            >
              <span className="font-bold text-sm">Mesa</span>
              <span className="font-bold text-xl">{mesa.nro_id}</span>

              {mesaHover === mesa.id && rolId === '1' && (
                <div className="absolute -top-2 -right-2 flex gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/mesas/${mesa.id}/editar`) }}
                    className="bg-blue-500 text-white text-xs px-2 py-1 rounded-lg hover:bg-blue-600"
                  >
                    Editar
                  </button>
                  <button
                    onClick={(e) => handleEliminarMesa(e, mesa.id)}
                    className="bg-red-500 text-white text-xs px-2 py-1 rounded-lg hover:bg-red-600"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          ))}

          {rolId === '1' && (
            <div
              onClick={() => navigate('/mesas/nueva')}
              className="w-24 h-24 rounded-xl flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-gray-300 text-gray-400 hover:border-orange-400 hover:text-orange-400 transition"
            >
              <span className="text-2xl">+</span>
              <span className="text-xs">Nueva mesa</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MapaMesas