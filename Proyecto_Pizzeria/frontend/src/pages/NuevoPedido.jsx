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
    <div>
      <button onClick={() => navigate(-1)}>← Volver</button>
      <button onClick={() => navigate('/dashboard')}>Inicio</button>
      <h1>Nuevo Pedido</h1>
      <h2>Elegir salón</h2>
      {salones.map(s => (
        <button key={s.id} onClick={() => navigate(`/mesas?salon_id=${s.id}&modo=nuevo`)}>
          {s.nombre}
        </button>
      ))}
      <br />
      <button>Delivery</button>
      <button>Takeaway</button>
    </div>
  )
}

export default NuevoPedido