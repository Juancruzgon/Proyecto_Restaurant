import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPedidos } from '../services/api'

function Pedidos() {
  const [pedidos, setPedidos] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    getPedidos().then(data => setPedidos(data))

    const ws = new WebSocket('ws://localhost:8000/ws')
    ws.onmessage = () => {
      getPedidos().then(data => setPedidos(data))
    }

    return () => ws.close()
  }, [])

  const getEstadoLabel = (estadoId) => {
    const estados = { 1: 'Creado', 2: 'En preparación', 3: 'Listo', 4: 'Pagado' }
    return estados[estadoId] || 'Desconocido'
  }

  const getEstadoColor = (estadoId) => {
    const colores = {
      1: 'bg-blue-100 text-blue-800',
      2: 'bg-yellow-100 text-yellow-800',
      3: 'bg-green-100 text-green-800',
      4: 'bg-gray-100 text-gray-800'
    }
    return colores[estadoId] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold !text-orange-500">Pedidos</h1>
        <div className="flex gap-2">
          <button onClick={() => navigate(-1)} className="text-sm text-gray-500 border border-gray-300 px-3 py-1 rounded-lg hover:bg-gray-50 transition">← Volver</button>
          <button onClick={() => navigate('/dashboard')} className="text-sm text-gray-500 border border-gray-300 px-3 py-1 rounded-lg hover:bg-gray-50 transition">Inicio</button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto mt-6 px-4">
        <button
          onClick={() => navigate('/nuevo-pedido')}
          className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition mb-6"
        >
          + Nuevo Pedido
        </button>

        <div className="flex flex-col gap-3">
          {pedidos.map(p => (
            <div
              key={p.id}
              onClick={() => navigate(`/pedido/${p.mesa_id}`)}
              className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center justify-between cursor-pointer hover:shadow-md transition"
            >
              <div>
                <p className="font-semibold text-gray-800">Pedido #{p.nro_pedido}</p>
                <p className="text-sm text-gray-500">Mesa {p.mesa_id} · ${p.total}</p>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getEstadoColor(p.estado_id)}`}>
                {getEstadoLabel(p.estado_id)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Pedidos