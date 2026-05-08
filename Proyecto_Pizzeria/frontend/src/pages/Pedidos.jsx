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

  return (
    <div>
      <button onClick={() => navigate(-1)}>← Volver</button>
      <button onClick={() => navigate('/dashboard')}>Inicio</button>
      <h1>Pedidos</h1>
      <button onClick={() => navigate('/nuevo-pedido')}>Nuevo Pedido</button>

      {pedidos.map(p => (
        <div key={p.id}>
          <p>Pedido #{p.nro_pedido} — Mesa {p.mesa_id} — Estado {p.estado_id} — Total ${p.total}</p>
        </div>
      ))}
    </div>
  )
}

export default Pedidos