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
    <div>
      <button onClick={() => navigate(-1)}>← Volver</button>
      <button onClick={() => navigate('/dashboard')}>Inicio</button>
      <h1>Mapa de Mesas</h1>
      <div>
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
            style={{
              background: mesa.estado_id === 1 ? 'green' : 'red',
              color: 'white',
              padding: '20px',
              margin: '10px',
              display: 'inline-block',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            Mesa {mesa.nro_id}
            {mesaHover === mesa.id && rolId === '1' && (
              <div style={{ position: 'absolute', top: 0, right: 0, display: 'flex', gap: '4px' }}>
                <button
                  onClick={(e) => { e.stopPropagation(); navigate(`/mesas/${mesa.id}/editar`) }}
                  style={{ fontSize: '10px', padding: '2px 6px' }}
                >
                  Editar
                </button>
                <button
                  onClick={(e) => handleEliminarMesa(e, mesa.id)}
                  style={{ fontSize: '10px', padding: '2px 6px', background: 'darkred' }}
                >
                  Eliminar
                </button>
              </div>
            )}
          </div>
        ))}

        {rolId === '1' && (
          <div
            onClick={() => navigate('/mesas/nueva')}
            style={{
              background: '#ccc',
              color: '#333',
              padding: '20px',
              margin: '10px',
              display: 'inline-block',
              cursor: 'pointer',
              border: '2px dashed #999'
            }}
          >
            + Nueva mesa
          </div>
        )}
      </div>
    </div>
  )
}

export default MapaMesas