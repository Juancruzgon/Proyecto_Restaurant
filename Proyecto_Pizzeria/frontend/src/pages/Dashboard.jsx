import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

const MESA_OCUPADA   = 2
const ESTADO_CREADO  = 1
const ESTADO_COCINA  = 2
const ESTADO_LISTO   = 3
const ESTADO_PAGADO  = 4

const WINE = '#7C2D12'

const estadoLabel = {
  [ESTADO_CREADO]: 'Creado',
  [ESTADO_COCINA]: 'En cocina',
  [ESTADO_LISTO]:  'Listo',
  [ESTADO_PAGADO]: 'Pagado',
}

const estadoStyle = {
  [ESTADO_CREADO]: { bg: '#FEF9C3', color: '#854D0E' },
  [ESTADO_COCINA]: { bg: '#FEE2E2', color: '#991B1B' },
  [ESTADO_LISTO]:  { bg: '#DCFCE7', color: '#166534' },
  [ESTADO_PAGADO]: { bg: '#F3F4F6', color: '#6B7280' },
}

function fmtHora(h) {
  return h ? String(h).slice(0, 5) : ''
}

function fmtPeso(val) {
  return '$' + Number(val).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export default function Dashboard() {
  const navigate = useNavigate()
  const nombre   = localStorage.getItem('nombre')
  const horaActual = new Date().getHours()
  const saludo   = horaActual < 12 ? 'Buenos días' : horaActual < 19 ? 'Buenas tardes' : 'Buenas noches'

  const [pedidos, setPedidos] = useState([])
  const [mesas,   setMesas]   = useState([])
  const [loading, setLoading] = useState(true)

  const cargar = useCallback(async () => {
    try {
      const [resPedidos, resMesas] = await Promise.all([
        api.get('/pedidos/'),
        api.get('/mesas/'),
      ])
      setPedidos(resPedidos.data.filter(p => p.activo))
      setMesas(resMesas.data.filter(m => m.activo))
    } catch (e) {
      console.error('Error cargando dashboard:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const pedidosAbiertos = pedidos.filter(p => p.estado_id !== ESTADO_PAGADO)
  const listosCobrar    = pedidos.filter(p => p.estado_id === ESTADO_LISTO)
  const mesasOcupadas   = mesas.filter(m => m.estado_id === MESA_OCUPADA)
  const ventasHoy       = pedidos
    .filter(p => p.estado_id === ESTADO_PAGADO)
    .reduce((acc, p) => acc + Number(p.total), 0)
  const pedidosPagados  = pedidos.filter(p => p.estado_id === ESTADO_PAGADO).length

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#A0786A', fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}>
      Cargando...
    </div>
  )

  return (
    <div style={{ padding: '32px 36px', fontFamily: "'DM Sans', sans-serif", maxWidth: 1200 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#1A0A06', letterSpacing: '-0.5px' }}>
            {saludo}, {nombre} 👋
          </div>
          <div style={{ fontSize: 13, color: '#A0786A', marginTop: 3 }}>
            {new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
        <button
          onClick={() => navigate('/nuevo-pedido')}
          style={{
            background: WINE, color: '#fff', border: 'none',
            borderRadius: 12, padding: '10px 22px',
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
            letterSpacing: '-0.2px',
          }}
        >
          + Nuevo pedido
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 14, marginBottom: 28 }}>

        {/* Card principal — rojo vino */}
        <div style={{ background: WINE, borderRadius: 16, padding: '24px 26px', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontSize: 14, fontWeight: 500, opacity: 0.8 }}>Pedidos activos</span>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
            }}>📋</div>
          </div>
          <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: '-2px', lineHeight: 1 }}>
            {pedidosAbiertos.length}
          </div>
          <div style={{ fontSize: 12, opacity: 0.65, marginTop: 10 }}>
            {listosCobrar.length > 0
              ? `${listosCobrar.length} listo${listosCobrar.length > 1 ? 's' : ''} para cobrar`
              : 'Sin pedidos listos para cobrar'}
          </div>
        </div>

        {/* Mesas ocupadas */}
        <div style={{ background: '#fff', border: '1px solid #EDE0DB', borderRadius: 16, padding: '24px 26px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontSize: 13, color: '#A0786A', fontWeight: 500 }}>Mesas ocupadas</span>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: '#FEF2EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>⊞</div>
          </div>
          <div style={{ fontSize: 46, fontWeight: 800, color: '#1A0A06', letterSpacing: '-1.5px', lineHeight: 1 }}>
            {mesasOcupadas.length}
          </div>
          <div style={{ fontSize: 12, color: '#A0786A', marginTop: 10 }}>
            de {mesas.length} mesas totales
          </div>
        </div>

        {/* Ventas del día */}
        <div style={{ background: '#fff', border: '1px solid #EDE0DB', borderRadius: 16, padding: '24px 26px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontSize: 13, color: '#A0786A', fontWeight: 500 }}>Ventas hoy</span>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>📈</div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#1A0A06', letterSpacing: '-1px', lineHeight: 1 }}>
            {fmtPeso(ventasHoy)}
          </div>
          <div style={{ fontSize: 12, color: '#A0786A', marginTop: 10 }}>
            {pedidosPagados} pedido{pedidosPagados !== 1 ? 's' : ''} cerrado{pedidosPagados !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Dos paneles */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Panel izquierdo: Pedidos abiertos */}
        <div style={{ background: '#fff', border: '1px solid #EDE0DB', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '16px 22px', borderBottom: '1px solid #EDE0DB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: '#1A0A06' }}>Pedidos abiertos</span>
            <button
              onClick={() => navigate('/pedidos')}
              style={{ fontSize: 12, color: WINE, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
            >
              Ver todos →
            </button>
          </div>

          {pedidosAbiertos.length === 0 ? (
            <div style={{ padding: '48px 22px', textAlign: 'center', color: '#C09080', fontSize: 13 }}>
              No hay pedidos activos
            </div>
          ) : (
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              {pedidosAbiertos.map(p => {
                const est = estadoStyle[p.estado_id] || estadoStyle[ESTADO_CREADO]
                const clickable = !!p.mesa_id
                return (
                  <div
                    key={p.id}
                    onClick={() => clickable && navigate(`/pedido/${p.mesa_id}`)}
                    style={{
                      display: 'flex', alignItems: 'center',
                      padding: '12px 22px',
                      borderBottom: '1px solid #F5EDE8',
                      cursor: clickable ? 'pointer' : 'default',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => { if (clickable) e.currentTarget.style.background = '#FEF9F7' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                  >
                    {/* Avatar */}
                    <div style={{
                      width: 38, height: 38, borderRadius: 10,
                      background: p.mesa_id ? '#FEF2EE' : '#F3F4F6',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700,
                      color: p.mesa_id ? WINE : '#6B7280',
                      flexShrink: 0, marginRight: 12,
                    }}>
                      {p.mesa_id ? `M${p.mesa_id}` : (p.tipo_pedido || 'XX').slice(0, 2).toUpperCase()}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1A0A06' }}>
                        {p.mesa_id ? `Mesa ${p.mesa_id}` : p.tipo_pedido}
                      </div>
                      <div style={{ fontSize: 11, color: '#A0786A', marginTop: 1 }}>
                        #{p.nro_pedido} · {fmtHora(p.hora)}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{
                        display: 'inline-block',
                        fontSize: 10, fontWeight: 600,
                        padding: '2px 8px', borderRadius: 20,
                        background: est.bg, color: est.color,
                        marginBottom: 3,
                      }}>
                        {estadoLabel[p.estado_id] || '—'}
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#1A0A06' }}>
                        {fmtPeso(p.total)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Panel derecho: Listos para cobrar */}
        <div style={{ background: '#fff', border: '1px solid #EDE0DB', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '16px 22px', borderBottom: '1px solid #EDE0DB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: '#1A0A06' }}>Listos para cobrar</span>
            <span style={{
              fontSize: 11, fontWeight: 700,
              padding: '3px 10px', borderRadius: 20,
              background: listosCobrar.length > 0 ? '#FEF2EE' : '#F3F4F6',
              color: listosCobrar.length > 0 ? WINE : '#9CA3AF',
            }}>
              {listosCobrar.length}
            </span>
          </div>

          {listosCobrar.length === 0 ? (
            <div style={{ padding: '48px 22px', textAlign: 'center', color: '#C09080', fontSize: 13 }}>
              Sin pedidos pendientes de cobro
            </div>
          ) : (
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              {listosCobrar.map(p => (
                <div
                  key={p.id}
                  style={{
                    display: 'flex', alignItems: 'center',
                    padding: '12px 22px',
                    borderBottom: '1px solid #F5EDE8',
                  }}
                >
                  <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: '#DCFCE7',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, color: '#166534',
                    flexShrink: 0, marginRight: 12,
                  }}>
                    {p.mesa_id ? `M${p.mesa_id}` : (p.tipo_pedido || 'XX').slice(0, 2).toUpperCase()}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1A0A06' }}>
                      {p.mesa_id ? `Mesa ${p.mesa_id}` : p.tipo_pedido}
                    </div>
                    <div style={{ fontSize: 11, color: '#A0786A', marginTop: 1 }}>
                      #{p.nro_pedido} · {fmtHora(p.hora)}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1A0A06' }}>
                      {fmtPeso(p.total)}
                    </div>
                    <button
                      onClick={() => p.mesa_id && navigate(`/pedido/${p.mesa_id}`)}
                      style={{
                        background: WINE, color: '#fff', border: 'none',
                        borderRadius: 8, padding: '6px 14px',
                        fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Cobrar →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
