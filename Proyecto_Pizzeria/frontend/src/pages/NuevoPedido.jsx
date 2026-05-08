import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSalones } from '../services/api'

function NuevoPedido() {
  const [salones, setSalones] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    getSalones().then(data => setSalones(data))
  }, [])

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold !text-orange-500">Nuevo Pedido</h1>
        <div className="flex gap-2">
          <button onClick={() => navigate(-1)} className="text-sm text-gray-500 border border-gray-300 px-3 py-1 rounded-lg hover:bg-gray-50 transition">← Volver</button>
          <button onClick={() => navigate('/dashboard')} className="text-sm text-gray-500 border border-gray-300 px-3 py-1 rounded-lg hover:bg-gray-50 transition">Inicio</button>
        </div>
      </div>

      <div className="max-w-sm mx-auto mt-10 px-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">¿Qué tipo de pedido?</h2>
        <div className="flex flex-col gap-3">
          {salones.map(s => (
            <button
              key={s.id}
              onClick={() => navigate(`/mesas?salon_id=${s.id}&modo=nuevo`)}
              className="bg-white border border-gray-200 rounded-xl px-6 py-4 text-left font-semibold text-gray-700 hover:shadow-md hover:border-orange-300 transition"
            >
              🍽️ {s.nombre}
            </button>
          ))}
          <button className="bg-white border border-gray-200 rounded-xl px-6 py-4 text-left font-semibold text-gray-400 cursor-not-allowed">
            🛵 Delivery (próximamente)
          </button>
          <button className="bg-white border border-gray-200 rounded-xl px-6 py-4 text-left font-semibold text-gray-400 cursor-not-allowed">
            🥡 Takeaway (próximamente)
          </button>
        </div>
      </div>
    </div>
  )
}

export default NuevoPedido