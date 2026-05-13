import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPedidos, getUsuarios } from '../services/api'

const WINE = '#7C2D12'

const ESTADOS = {
  1: { label: 'Creado',       bg: '#FEF9C3', color: '#854D0E' },
  2: { label: 'En cocina',    bg: '#FEE2E2', color: '#991B1B' },
  3: { label: 'Listo',        bg: '#DCFCE7', color: '#166534' },
  4: { label: 'Pagado',       bg: '#F3F4F6', color: '#6B7280' },
}

const FILTROS = [
  { id: null, label: 'Todos'     },
  { id: 1,    label: 'Creados'   },
  { id: 2,    label: 'En cocina' },
  { id: 3,    label: 'Listos'    },
  { id: 4,    label: 'Pagados'   },
]

function fmtPeso(val) {
  return '$' + Number(val).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function fmtHora(h) {
  return h ? String(h).slice(0, 5) : ''
}

export default function Pedidos() {
  const navigate  = useNavigate()
  const [pedidos,   setPedidos]   = useState([])
  const [usuarios,  setUsuarios]  = useState([])
  const [filtro,    setFiltro]    = useState(null)
  const [loading,   setLoading]   = useState(true)

  const cargar = () => {
    Promise.all([getPedidos(), getUsuarios()]).then(([p, u]) => {
      setPedidos(p)
      setUsuarios(u)
      setLoading(false)
    })
  }

  useEffect(() => {
    cargar()
    const ws = new WebSocket('ws://localhost:8000/ws')
    ws.onmessage = () => cargar()
    return () => ws.close()
  }, [])

  const getMozo = (usuarioId) => {
    const u = usuarios.find(u => u.id === usuarioId)
    return u ? `${u.nombre} ${u.apellido}` : null
  }

  const pedidosFiltrados = filtro === null
    ? pedidos
    : pedidos.filter(p => p.estado_id === filtro)

  const counts = FILTROS.map(f => ({
    ...f,
    count: f.id === null ? pedidos.length : pedidos.filter(p => p.estado_id === f.id).length
  }))

  return (
    <div style={{ padding: '28px 32px', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#1A0A06', letterSpacing: '-0.4px' }}>Pedidos</div>
          <div style={{ fontSize: 13, color: '#A0786A', marginTop: 2 }}>
            {pedidos.filter(p => p.estado_id !== 4).length} activos · {pedidos.filter(p => p.estado_id === 4).length} cerrados hoy
          </div>
        </div>
        <button
          onClick={() => navigate('/nuevo-pedido')}
          style={{
            background: WINE, color: '#fff', border: 'none',
            borderRadius: 10, padding: '8px 18px',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}
        >
          + Nuevo pedido
        </button>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {counts.map(f => (
          <button
            key={f.id ?? 'all'}
            onClick={() => setFiltro(f.id)}
            style={{
              background: filtro === f.id ? WINE : '#fff',
              color:      filtro === f.id ? '#fff' : '#5C3A2E',
              border:     `1px solid ${filtro === f.id ? WINE : '#EDE0DB'}`,
              borderRadius: 20, padding: '6px 14px',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              transition: 'all 0.15s',
            }}
          >
            {f.label}
            <span style={{
              background: filtro === f.id ? 'rgba(255,255,255,0.25)' : '#F3EDE8',
              color:      filtro === f.id ? '#fff' : '#A0786A',
              borderRadius: 20, padding: '1px 7px', fontSize: 11,
            }}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <div style={{ textAlign: 'center', color: '#A0786A', fontSize: 13, padding: '48px 0' }}>Cargando...</div>
      ) : pedidosFiltrados.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#C09080', fontSize: 13, padding: '48px 0' }}>
          No hay pedidos {filtro !== null ? `con estado "${ESTADOS[filtro]?.label}"` : ''}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {pedidosFiltrados.map(p => {
            const est   = ESTADOS[p.estado_id] || ESTADOS[1]
            const mozo  = getMozo(p.usuario_id)
            return (
              <div
                key={p.id}
                onClick={() => p.mesa_id && navigate(`/pedido/${p.mesa_id}`)}
                style={{
                  background: '#fff',
                  border: '1px solid #EDE0DB',
                  borderRadius: 14,
                  padding: '14px 20px',
                  display: 'flex', alignItems: 'center', gap: 14,
                  cursor: p.mesa_id ? 'pointer' : 'default',
                  transition: 'box-shadow 0.15s',
                }}
                onMouseEnter={e => { if (p.mesa_id) e.currentTarget.style.boxShadow = '0 4px 16px rgba(124,45,18,0.08)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none' }}
              >
                {/* Avatar */}
                <div style={{
                  width: 44, height: 44, borderRadius: 11,
                  background: p.mesa_id ? '#FEF2EE' : '#F3F4F6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700,
                  color: p.mesa_id ? WINE : '#6B7280',
                  flexShrink: 0,
                }}>
                  {p.mesa_id ? `M${p.mesa_id}` : (p.tipo_pedido || '').slice(0, 2).toUpperCase()}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1A0A06' }}>
                    {p.mesa_id ? `Mesa ${p.mesa_id}` : p.tipo_pedido}
                    <span style={{ fontSize: 12, fontWeight: 400, color: '#A0786A', marginLeft: 8 }}>
                      #{p.nro_pedido}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: '#A0786A', marginTop: 2, display: 'flex', gap: 10 }}>
                    <span>{fmtHora(p.hora)}</span>
                    {mozo && <span>👤 {mozo}</span>}
                  </div>
                </div>

                {/* Total + estado */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#1A0A06', marginBottom: 4 }}>
                    {fmtPeso(p.total)}
                  </div>
                  <div style={{
                    display: 'inline-block',
                    fontSize: 11, fontWeight: 600,
                    padding: '2px 10px', borderRadius: 20,
                    background: est.bg, color: est.color,
                  }}>
                    {est.label}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
