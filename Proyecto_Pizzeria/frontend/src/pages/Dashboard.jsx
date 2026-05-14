import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

const MESA_OCUPADA  = 2
const ESTADO_COCINA = 2
const ESTADO_LISTO  = 3
const ESTADO_PAGADO = 4

const WINE       = '#7C2D12'
const WINE_LIGHT = '#FEF2EE'

const estadoLabel = {
  [ESTADO_COCINA]: 'En cocina',
  [ESTADO_LISTO]:  'Listo',
  [ESTADO_PAGADO]: 'Pagado',
}

const estadoStyle = {
  [ESTADO_COCINA]: { bg: '#FEE2E2', color: '#991B1B' },
  [ESTADO_LISTO]:  { bg: '#DCFCE7', color: '#166534' },
  [ESTADO_PAGADO]: { bg: '#F3F4F6', color: '#6B7280' },
}

function fmtHora(h) { return h ? String(h).slice(0, 5) : '' }
function fmtPeso(val) {
  return '$' + Number(val).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export default function Dashboard() {
  const navigate   = useNavigate()
  const nombre     = localStorage.getItem('nombre')
  const rolId      = localStorage.getItem('rol_id')
  const isAdmin    = rolId === '1'
  const horaActual = new Date().getHours()
  const saludo     = horaActual < 12 ? 'Buenos días' : horaActual < 19 ? 'Buenas tardes' : 'Buenas noches'

  const [pedidos,        setPedidos]        = useState([])
  const [mesas,          setMesas]          = useState([])
  const [caja,           setCaja]           = useState(null)
  const [loading,        setLoading]        = useState(true)
  const [recordatorios,  setRecordatorios]  = useState([])
  const [mostrarRec,     setMostrarRec]     = useState(true)
  const [nuevoTitulo,    setNuevoTitulo]    = useState('')
  const [nuevoDesc,      setNuevoDesc]      = useState('')
  const [mostrarFormRec, setMostrarFormRec] = useState(false)
  

const cargar = useCallback(async () => {
  try {
    const [resPedidos, resMesas, resRec, resCaja] = await Promise.all([
      api.get('/pedidos/'),
      api.get('/mesas/'),
      api.get('/recordatorios/'),
      api.get('/caja/activa'),
    ])
    const cajaData = resCaja.data
    setPedidos(resPedidos.data.filter(p => p.activo))
    setMesas(resMesas.data.filter(m => m.activo))
    setRecordatorios(resRec.data)
    setCaja(cajaData)

    // Traer pagados del turno
    if (cajaData?.id) {
      const resPagados = await api.get(`/pedidos/?caja_id=${cajaData.id}&pagados=true`)
      setPedidosPagados(resPagados.data)
    }
  } catch (e) {
    console.error('Error cargando dashboard:', e)
  } finally {
    setLoading(false)
  }
}, [])

  useEffect(() => { cargar() }, [cargar])

  const handleMarcarLeido = async (id) => {
    await api.put(`/recordatorios/${id}/leido`)
    setRecordatorios(prev => prev.filter(r => r.id !== id))
  }

  const handleCrearRecordatorio = async () => {
    if (!nuevoTitulo.trim()) return
    await api.post('/recordatorios/', { titulo: nuevoTitulo, descripcion: nuevoDesc || null })
    setNuevoTitulo(''); setNuevoDesc(''); setMostrarFormRec(false)
    const res = await api.get('/recordatorios/')
    setRecordatorios(res.data)
  }

  const pedidosAbiertos = pedidos.filter(p => p.estado_id !== ESTADO_PAGADO)
  const listosCobrar    = pedidos.filter(p => p.estado_id === ESTADO_LISTO)
  const mesasOcupadas   = mesas.filter(m => m.estado_id === MESA_OCUPADA)

  // Ventas del turno activo (caja abierta) o del día si no hay caja
  const [pedidosPagados, setPedidosPagados] = useState([])
  const pedidosTurno   = caja
    ? pedidosPagados.filter(p => p.caja_id === caja.id)
    : pedidosPagados

  const ventasTurno  = pedidosPagados.reduce((acc, p) => acc + Number(p.total), 0)
  const labelVentas  = caja ? 'Ventas del turno' : 'Ventas hoy'

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
            {caja && (
              <span style={{ marginLeft: 10, fontSize: 11, fontWeight: 600, color: '#166534', background: '#DCFCE7', borderRadius: 20, padding: '2px 8px' }}>
                🟢 Caja abierta desde {new Date(caja.fecha_apertura).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => navigate('/nuevo-pedido')}
          style={{ background: WINE, color: '#fff', border: 'none', borderRadius: 12, padding: '10px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
        >
          + Nuevo pedido
        </button>
      </div>

      {/* Recordatorios */}
      {(recordatorios.length > 0 || isAdmin) && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: mostrarRec ? 10 : 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#1A0A06' }}>📌 Recordatorios</span>
              {recordatorios.length > 0 && (
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: WINE_LIGHT, color: WINE }}>
                  {recordatorios.length}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {isAdmin && mostrarRec && (
                <button onClick={() => setMostrarFormRec(v => !v)} style={{ fontSize: 12, fontWeight: 600, color: WINE, background: 'none', border: 'none', cursor: 'pointer' }}>
                  + Nuevo
                </button>
              )}
              <button onClick={() => setMostrarRec(v => !v)} style={{ fontSize: 12, color: '#A0786A', background: 'none', border: 'none', cursor: 'pointer' }}>
                {mostrarRec ? 'Cerrar ✕' : 'Ver ▾'}
              </button>
            </div>
          </div>

          {mostrarRec && (
            <div>
              {isAdmin && mostrarFormRec && (
                <div style={{ background: '#fff', border: `1px solid ${WINE}`, borderRadius: 12, padding: '14px 16px', marginBottom: 10 }}>
                  <input autoFocus value={nuevoTitulo} onChange={e => setNuevoTitulo(e.target.value)} placeholder="Título del recordatorio"
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #EDE0DB', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'inherit', color: '#1A0A06', marginBottom: 8 }} />
                  <textarea value={nuevoDesc} onChange={e => setNuevoDesc(e.target.value)} placeholder="Descripción (opcional)" rows={2}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #EDE0DB', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'inherit', color: '#1A0A06', resize: 'none', marginBottom: 10 }} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={handleCrearRecordatorio} style={{ flex: 1, background: WINE, color: '#fff', border: 'none', borderRadius: 8, padding: '8px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Guardar</button>
                    <button onClick={() => { setMostrarFormRec(false); setNuevoTitulo(''); setNuevoDesc('') }} style={{ flex: 1, background: 'none', color: '#5C3A2E', border: '1px solid #EDE0DB', borderRadius: 8, padding: '8px', fontSize: 13, cursor: 'pointer' }}>Cancelar</button>
                  </div>
                </div>
              )}
              {recordatorios.length === 0 ? (
                <div style={{ fontSize: 13, color: '#C09080', padding: '8px 0' }}>No hay recordatorios pendientes</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {recordatorios.map(r => (
                    <div key={r.id} style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#1A0A06' }}>{r.titulo}</div>
                        {r.descripcion && <div style={{ fontSize: 12, color: '#A0786A', marginTop: 2 }}>{r.descripcion}</div>}
                        <div style={{ fontSize: 11, color: '#C09080', marginTop: 3 }}>{r.fecha}</div>
                      </div>
                      <button onClick={() => handleMarcarLeido(r.id)} style={{ fontSize: 11, fontWeight: 600, color: '#166534', background: '#DCFCE7', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        ✓ Leído
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 14, marginBottom: 28 }}>
        <div style={{ background: WINE, borderRadius: 16, padding: '24px 26px', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontSize: 14, fontWeight: 500, opacity: 0.8 }}>Pedidos activos</span>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📋</div>
          </div>
          <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: '-2px', lineHeight: 1 }}>{pedidosAbiertos.length}</div>
          <div style={{ fontSize: 12, opacity: 0.65, marginTop: 10 }}>
            {listosCobrar.length > 0 ? `${listosCobrar.length} listo${listosCobrar.length > 1 ? 's' : ''} para cobrar` : 'Sin pedidos listos para cobrar'}
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #EDE0DB', borderRadius: 16, padding: '24px 26px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontSize: 13, color: '#A0786A', fontWeight: 500 }}>Mesas ocupadas</span>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: '#FEF2EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>⊞</div>
          </div>
          <div style={{ fontSize: 46, fontWeight: 800, color: '#1A0A06', letterSpacing: '-1.5px', lineHeight: 1 }}>{mesasOcupadas.length}</div>
          <div style={{ fontSize: 12, color: '#A0786A', marginTop: 10 }}>de {mesas.length} mesas totales</div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #EDE0DB', borderRadius: 16, padding: '24px 26px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontSize: 13, color: '#A0786A', fontWeight: 500 }}>{labelVentas}</span>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>📈</div>
          </div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#1A0A06', letterSpacing: '-1px', lineHeight: 1 }}>{fmtPeso(ventasTurno)}</div>
          <div style={{ fontSize: 12, color: '#A0786A', marginTop: 10 }}>
            {pedidosPagados.length} pedido{pedidosPagados.length !== 1 ? 's' : ''} cerrado{pedidosPagados.length !== 1 ? 's' : ''}
            {!caja && <span style={{ marginLeft: 4, color: '#EF4444', fontSize: 10 }}>· Caja cerrada</span>}
          </div>
        </div>
      </div>

      {/* Dos paneles */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        <div style={{ background: '#fff', border: '1px solid #EDE0DB', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '16px 22px', borderBottom: '1px solid #EDE0DB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: '#1A0A06' }}>Pedidos abiertos</span>
            <button onClick={() => navigate('/pedidos')} style={{ fontSize: 12, color: WINE, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Ver todos →</button>
          </div>
          {pedidosAbiertos.length === 0 ? (
            <div style={{ padding: '48px 22px', textAlign: 'center', color: '#C09080', fontSize: 13 }}>No hay pedidos activos</div>
          ) : (
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              {pedidosAbiertos.map(p => {
                const est = estadoStyle[p.estado_id] || estadoStyle[ESTADO_COCINA]
                const clickable = !!p.mesa_id
                return (
                  <div key={p.id}
                    onClick={() => clickable && navigate(`/pedido/${p.mesa_id}?tipo=Salon`)}
                    style={{ display: 'flex', alignItems: 'center', padding: '12px 22px', borderBottom: '1px solid #F5EDE8', cursor: clickable ? 'pointer' : 'default' }}
                    onMouseEnter={e => { if (clickable) e.currentTarget.style.background = '#FEF9F7' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                  >
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: p.mesa_id ? '#FEF2EE' : '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: p.mesa_id ? WINE : '#6B7280', flexShrink: 0, marginRight: 12 }}>
                      {p.mesa_id ? `M${p.mesa_id}` : (p.tipo_pedido || 'XX').slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1A0A06' }}>{p.mesa_id ? `Mesa ${p.mesa_id}` : p.tipo_pedido}</div>
                      <div style={{ fontSize: 11, color: '#A0786A', marginTop: 1 }}>#{p.nro_pedido} · {fmtHora(p.hora)}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ display: 'inline-block', fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: est.bg, color: est.color, marginBottom: 3 }}>
                        {estadoLabel[p.estado_id] || '—'}
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#1A0A06' }}>{fmtPeso(p.total)}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div style={{ background: '#fff', border: '1px solid #EDE0DB', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '16px 22px', borderBottom: '1px solid #EDE0DB', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: '#1A0A06' }}>Listos para cobrar</span>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: listosCobrar.length > 0 ? '#FEF2EE' : '#F3F4F6', color: listosCobrar.length > 0 ? WINE : '#9CA3AF' }}>
              {listosCobrar.length}
            </span>
          </div>
          {listosCobrar.length === 0 ? (
            <div style={{ padding: '48px 22px', textAlign: 'center', color: '#C09080', fontSize: 13 }}>Sin pedidos pendientes de cobro</div>
          ) : (
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              {listosCobrar.map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', padding: '12px 22px', borderBottom: '1px solid #F5EDE8' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#166534', flexShrink: 0, marginRight: 12 }}>
                    {p.mesa_id ? `M${p.mesa_id}` : (p.tipo_pedido || 'XX').slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1A0A06' }}>{p.mesa_id ? `Mesa ${p.mesa_id}` : p.tipo_pedido}</div>
                    <div style={{ fontSize: 11, color: '#A0786A', marginTop: 1 }}>#{p.nro_pedido} · {fmtHora(p.hora)}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1A0A06' }}>{fmtPeso(p.total)}</div>
                    <button
                      onClick={() => p.mesa_id && navigate(`/pedido/${p.mesa_id}?tipo=Salon`)}
                      style={{ background: WINE, color: '#fff', border: 'none', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
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