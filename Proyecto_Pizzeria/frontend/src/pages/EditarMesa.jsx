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
    <div>
      <button onClick={() => navigate(-1)}>← Volver</button>
      <button onClick={() => navigate('/dashboard')}>Inicio</button>
      <h1>Editar Mesa</h1>
      <label>Número de mesa:</label>
      <input type="number" value={nroId} onChange={(e) => setNroId(e.target.value)} />
      <label>Capacidad:</label>
      <input type="number" value={capacidad} onChange={(e) => setCapacidad(e.target.value)} />
      <label>Salón:</label>
      <select value={salonId} onChange={(e) => setSalonId(e.target.value)}>
        <option value="">Sin salón</option>
        {salones.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
      </select>
      <button onClick={handleGuardar}>Guardar</button>
    </div>
  )
}

export default EditarMesa