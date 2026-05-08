import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getMesaPorId, modificarMesa, getSalones } from '../services/api'

function EditarMesa() {
  const { mesaId } = useParams()
  const navigate = useNavigate()
  const [nroId, setNroId] = useState('')
  const [capacidad, setCapacidad] = useState('')
  const [salonId, setSalonId] = useState('')
  const [salones, setSalones] = useState([])

  useEffect(() => {
    getMesaPorId(mesaId).then(data => {
      setNroId(data.nro_id)
      setCapacidad(data.capacidad)
      setSalonId(data.salon_id)
    })
    getSalones().then(data => setSalones(data))
  }, [mesaId])

  const handleGuardar = () => {
    modificarMesa(mesaId, { nro_id: parseInt(nroId), capacidad: parseInt(capacidad), salon_id: parseInt(salonId) })
      .then(() => navigate('/mesas'))
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold !text-orange-500">Editar Mesa</h1>
        <div className="flex gap-2">
          <button onClick={() => navigate(-1)} className="text-sm text-gray-500 border border-gray-300 px-3 py-1 rounded-lg hover:bg-gray-50 transition">← Volver</button>
          <button onClick={() => navigate('/dashboard')} className="text-sm text-gray-500 border border-gray-300 px-3 py-1 rounded-lg hover:bg-gray-50 transition">Inicio</button>
        </div>
      </div>

      <div className="max-w-sm mx-auto mt-8 px-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Número de mesa</label>
              <input type="number" value={nroId} onChange={(e) => setNroId(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Capacidad</label>
              <input type="number" value={capacidad} onChange={(e) => setCapacidad(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Salón</label>
              <select value={salonId} onChange={(e) => setSalonId(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                <option value="">Sin salón</option>
                {salones.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
              </select>
            </div>
            <button onClick={handleGuardar} className="w-full bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition">
              Guardar cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditarMesa