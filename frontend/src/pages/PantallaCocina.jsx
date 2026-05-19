import { useState, useEffect, useCallback } from 'react'
import { getPedidos, getDetallePedido, cambiarEstadoPedido, marcarListoCocina } from '../services/api'

const WINE       = '#7C2D12'
const WINE_LIGHT = '#FEF2EE'

function fmtHora(h) {
  return h ? String(h).slice(0, 5) : ''
}

function tiempoTranscurrido(horaStr) {
  if (!horaStr) return ''
  const [hh, mm] = horaStr.split(':').map(Number)
  const ahora = new Date()
  const diff  = (ahora.getHours() * 60 + ahora.getMinutes()) - (hh * 60 + mm)
  if (diff < 1)  return 'Ahora'
  if (diff < 60) return `${diff} min`
  return `${Math.floor(diff / 60)}h ${diff % 60}min`
}

function colorTiempo(horaStr) {
  if (!horaStr) return '#A0786A'
  const [hh, mm] = horaStr.split(':').map(Number)
  const ahora    = new Date()
  const diff     = (ahora.getHours() * 60 + ahora.getMinutes()) - (hh * 60 + mm)
  if (diff >= 20) return '#EF4444'
  if (diff >= 10) return '#F59E0B'
  return '#16A34A'
}

const TIPO_ICONS = { Salon: '🍽️', Takeaway: '🥡', Delivery: '🛵' }

export default function PantallaCocina() {
  const [pedidos,  setPedidos]  = useState([])
  const [detalles, setDetalles] = useState({})
  const [hora,     setHora]     = useState(new Date())

  const cargar = useCallback(async () => {
    const data = await getPedidos({ para_cocina: true })
    setPedidos(data)
    const detallesNuevos = {}
    await Promise.all(data.map(async p => {
      try {
        const d = await getDetallePedido(p.id)
        detallesNuevos[p.id] = d
      } catch (e) {
        detallesNuevos[p.id] = []
      }
    }))
    setDetalles(detallesNuevos)
  }, [])

  useEffect(() => {
    document.body.style.background = '#F8F5F4'
    document.body.style.colorScheme = 'light'
    return () => {
      document.body.style.background = ''
      document.body.style.colorScheme = ''
    }
  }, [])

  useEffect(() => {
    cargar()
    const ws = new WebSocket('ws://localhost:8000/ws')
    ws.onmessage = () => cargar()
    return () => ws.close()
  }, [cargar])

  useEffect(() => {
    const interval = setInterval(() => {
      setHora(new Date())
      setPedidos(prev => [...prev])
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleMarcarListo = async (pedido) => {
    if (pedido.estado_id === 4) {
      await marcarListoCocina(pedido.id)
    } else {
      await cambiarEstadoPedido(pedido.id)
    }
    cargar()
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F8F5F4',
      fontFamily: "'DM Sans', sans-serif",
      padding: '24px',
      color: '#1A0A06',
    }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: WINE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🍕</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1A0A06', letterSpacing: '-0.3px' }}>Cocina</div>
            <div style={{ fontSize: 12, color: '#A0786A' }}>Panel en tiempo real</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-1px', color: '#1A0A06' }}>
            {hora.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div style={{ fontSize: 12, color: '#A0786A' }}>
            {hora.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>
      </div>

      {/* Contadores */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <div style={{ background: '#fff', border: '1px solid #EDE0DB', borderRadius: 12, padding: '10px 18px' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: WINE }}>{pedidos.filter(p => p.estado_id === 2).length}</div>
          <div style={{ fontSize: 11, color: '#A0786A' }}>en cocina</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #EDE0DB', borderRadius: 12, padding: '10px 18px' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#F59E0B' }}>
            {pedidos.filter(p => {
              if (!p.hora) return false
              const [hh, mm] = String(p.hora).split(':').map(Number)
              const diff = (new Date().getHours() * 60 + new Date().getMinutes()) - (hh * 60 + mm)
              return diff >= 10
            }).length}
          </div>
          <div style={{ fontSize: 11, color: '#A0786A' }}>+ de 10 min</div>
        </div>
      </div>

      {/* Grid pedidos */}
      {pedidos.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#C09080', fontSize: 16, marginTop: 80 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✓</div>
          Sin pedidos en cocina
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {pedidos.map(p => {
            const dets     = detalles[p.id] || []
            const tcColor  = colorTiempo(String(p.hora))
            const tcLabel  = tiempoTranscurrido(String(p.hora))
            const isPagado = p.estado_id === 4

            return (
             <div
                key={p.id}
                style={{
                  background: '#fff',
                  border: `1px solid ${isPagado ? '#86EFAC' : tcColor === '#EF4444' ? '#FECACA' : '#EDE0DB'}`,
                  borderRadius: 16,
                  overflow: 'hidden',
                }}
              >
                {/* Card header */}
                <div style={{
                  padding: '14px 18px',
                  background: isPagado ? '#F0FDF4' : tcColor === '#EF4444' ? '#FEF2F2' : WINE_LIGHT,
                  borderBottom: '1px solid #EDE0DB',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 20 }}>{TIPO_ICONS[p.tipo_pedido] || '🍽️'}</span>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#1A0A06', display: 'flex', alignItems: 'center', gap: 8 }}>
                        {p.tipo_pedido === 'Salon'
                          ? `Mesa ${p.mesa_id}`
                          : p.tipo_pedido === 'Takeaway' && p.pager
                            ? `Pager ${p.pager}`
                            : p.tipo_pedido}
                        {isPagado && (
                          <span style={{ fontSize: 11, fontWeight: 700, background: '#16A34A', color: '#fff', padding: '2px 8px', borderRadius: 20 }}>
                            PAGADO
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: '#A0786A' }}>
                        #{p.nro_pedido} · {fmtHora(String(p.hora))}
                      </div>
                    </div>
                  </div>
                  {!isPagado && (
                    <div style={{
                      fontSize: 13, fontWeight: 700,
                      color: tcColor,
                      background: `${tcColor}18`,
                      padding: '4px 10px', borderRadius: 20,
                    }}>
                      {tcLabel}
                    </div>
                  )}
                </div>

                {/* Productos */}
                <div style={{ padding: '12px 18px' }}>
                  {dets.length === 0 ? (
                    <div style={{ fontSize: 12, color: '#C09080' }}>Sin productos</div>
                  ) : (
                    dets.map((d, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'flex-start', gap: 10,
                        padding: '7px 0',
                        borderBottom: i < dets.length - 1 ? '1px solid #F5EDE8' : 'none',
                      }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                          background: WINE,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 13, fontWeight: 800, color: '#fff',
                        }}>
                          {d.cantidad}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#1A0A06' }}>
                            {d.nombre || `Producto ${d.producto_id}`}
                          </div>
                          {d.nota && (
                            <div style={{ fontSize: 11, color: '#D97706', marginTop: 2 }}>
                              ⚠ {d.nota}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Botón marcar listo */}
                <div style={{ padding: '10px 18px', borderTop: '1px solid #F5EDE8' }}>
                  <button
                    onClick={() => handleMarcarListo(p)}
                    style={{
                      width: '100%', background: '#16A34A',
                      color: '#fff', border: 'none', borderRadius: 10,
                      padding: '10px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    ✓ Marcar como listo
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}