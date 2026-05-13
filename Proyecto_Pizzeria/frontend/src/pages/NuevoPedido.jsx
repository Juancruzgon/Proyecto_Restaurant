import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api, { getSalones, getMesas } from '../services/api'

const WINE       = '#7C2D12'
const WINE_LIGHT = '#FEF2EE'
const MESA_W     = 84
const MESA_H     = 84
const GRID_GAP   = 20
const COLS       = 7

function posInicial(index) {
  const col = index % COLS
  const row = Math.floor(index / COLS)
  return {
    x: GRID_GAP + col * (MESA_W + GRID_GAP),
    y: GRID_GAP + row * (MESA_H + GRID_GAP),
  }
}

const TIPOS = [
  { id: 'Salon',    icon: '🍽️', label: 'Salón',    desc: 'Mesa en el salón'       },
  { id: 'Takeaway', icon: '🥡', label: 'Takeaway', desc: 'Retira en el mostrador' },
  { id: 'Delivery', icon: '🛵', label: 'Delivery', desc: 'Envío a domicilio'       },
]

export default function NuevoPedido() {
  const navigate = useNavigate()

  const [tipo,        setTipo]        = useState(null)
  const [salones,     setSalones]     = useState([])
  const [salonActivo, setSalonActivo] = useState(null)
  const [mesas,       setMesas]       = useState([])
  const [pager,       setPager]       = useState('')
  const posiciones = useRef({})

  useEffect(() => {
    getSalones().then(data => {
      setSalones(data)
      if (data.length > 0) setSalonActivo(data[0].id)
    })
  }, [])

  const cargarMesas = useCallback(async (salonId) => {
    const data = await getMesas(salonId)
    const activas = data.filter(m => m.activo)
    setMesas(activas)
    activas.forEach((m, i) => {
      posiciones.current[m.id] = (m.pos_x != null && m.pos_y != null)
        ? { x: m.pos_x, y: m.pos_y }
        : posInicial(i)
    })
  }, [])

  useEffect(() => {
    if (tipo === 'Salon' && salonActivo) cargarMesas(salonActivo)
  }, [tipo, salonActivo, cargarMesas])

  const handleClickMesa = (mesa) => {
    if (mesa.estado_id !== 1) return
    navigate(`/pedido/${mesa.id}?tipo=Salon`)
  }

  const handleIrDelivery = () => {
    navigate('/pedido/nuevo?tipo=Delivery')
  }

  const handleIrTakeaway = () => {
    if (!pager.trim()) return
    navigate(`/pedido/nuevo?tipo=Takeaway&pager=${encodeURIComponent(pager.trim())}`)
  }

  const mesasDelSalon = mesas.filter(m => m.salon_id === salonActivo)
  const canvasH = Math.max(
    300,
    ...mesasDelSalon.map((m, i) => {
      const pos = posiciones.current[m.id] || posInicial(i)
      return pos.y + MESA_H + GRID_GAP
    })
  )

  return (
    <div style={{ padding: '28px 32px', fontFamily: "'DM Sans', sans-serif", maxWidth: 900 }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#1A0A06', letterSpacing: '-0.4px' }}>
          Nuevo pedido
        </div>
        <div style={{ fontSize: 13, color: '#A0786A', marginTop: 2 }}>
          Seleccioná el tipo de pedido para continuar
        </div>
      </div>

      {/* Selector tipo */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}>
        {TIPOS.map(t => (
          <button
            key={t.id}
            onClick={() => setTipo(t.id)}
            style={{
              background: tipo === t.id ? WINE_LIGHT : '#fff',
              border: `2px solid ${tipo === t.id ? WINE : '#EDE0DB'}`,
              borderRadius: 14, padding: '18px 20px',
              textAlign: 'left', cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 10 }}>{t.icon}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: tipo === t.id ? WINE : '#1A0A06' }}>
              {t.label}
            </div>
            <div style={{ fontSize: 12, color: '#A0786A', marginTop: 3 }}>{t.desc}</div>
          </button>
        ))}
      </div>

      {/* ── Salón: mapa embedded ── */}
      {tipo === 'Salon' && (
        <div>
          {/* Tabs salones */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: '1px solid #EDE0DB' }}>
            {salones.map(s => (
              <button
                key={s.id}
                onClick={() => { posiciones.current = {}; setSalonActivo(s.id) }}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '7px 14px', fontSize: 13,
                  fontWeight: salonActivo === s.id ? 600 : 400,
                  color: salonActivo === s.id ? WINE : '#A0786A',
                  borderBottom: salonActivo === s.id ? `2px solid ${WINE}` : '2px solid transparent',
                  marginBottom: -1, transition: 'all 0.15s',
                }}
              >
                {s.nombre}
              </button>
            ))}
          </div>

          <div style={{ fontSize: 12, color: '#A0786A', marginBottom: 10 }}>
            Tocá una mesa libre para abrir el pedido
          </div>

          {/* Canvas mesas */}
          <div style={{
            position: 'relative', width: '100%', height: canvasH,
            background: '#fff', border: '1px solid #EDE0DB',
            borderRadius: 14, overflow: 'hidden',
            backgroundImage: 'radial-gradient(circle, #EDE0DB 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}>
            {mesasDelSalon.map((mesa, i) => {
              const pos   = posiciones.current[mesa.id] || posInicial(i)
              const libre = mesa.estado_id === 1
              return (
                <div
                  key={mesa.id}
                  onClick={() => handleClickMesa(mesa)}
                  style={{
                    position: 'absolute',
                    left: pos.x, top: pos.y,
                    width: MESA_W, height: MESA_H,
                    background: libre ? '#F0FDF4' : WINE_LIGHT,
                    border: `2px solid ${libre ? '#86EFAC' : '#FCA5A5'}`,
                    borderRadius: 12,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    cursor: libre ? 'pointer' : 'not-allowed',
                    opacity: libre ? 1 : 0.6,
                    transition: 'box-shadow 0.15s',
                  }}
                  onMouseEnter={e => { if (libre) e.currentTarget.style.boxShadow = '0 4px 16px rgba(124,45,18,0.15)' }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none' }}
                >
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: libre ? '#22C55E' : WINE, marginBottom: 5 }} />
                  <div style={{ fontSize: 10, fontWeight: 600, color: libre ? '#166534' : WINE, opacity: 0.7 }}>Mesa</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: libre ? '#166534' : WINE, lineHeight: 1 }}>{mesa.nro_id}</div>
                  <div style={{ fontSize: 9, color: libre ? '#166534' : WINE, opacity: 0.6, marginTop: 2 }}>{mesa.capacidad} pers.</div>
                  {!libre && (
                    <div style={{ fontSize: 9, color: WINE, fontWeight: 600, marginTop: 2 }}>Ocupada</div>
                  )}
                </div>
              )
            })}
            {mesasDelSalon.length === 0 && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C09080', fontSize: 13 }}>
                No hay mesas en este salón
              </div>
            )}
          </div>

          {/* Leyenda */}
          <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
            {[{ label: 'Libre', dot: '#22C55E' }, { label: 'Ocupada', dot: WINE }].map(({ label, dot }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: dot }} />
                <span style={{ fontSize: 11, color: '#A0786A' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Takeaway: campo pager ── */}
      {tipo === 'Takeaway' && (
        <div style={{
          background: '#fff', border: '1px solid #EDE0DB',
          borderRadius: 14, padding: '24px',
          maxWidth: 400,
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1A0A06', marginBottom: 6 }}>
            Número de pager
          </div>
          <div style={{ fontSize: 12, color: '#A0786A', marginBottom: 14 }}>
            Ingresá el número del pager que se le entrega al cliente
          </div>
          <input
            type="text"
            placeholder="Ej: 42"
            value={pager}
            onChange={e => setPager(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleIrTakeaway()}
            style={{
              width: '100%', padding: '10px 14px',
              border: '1px solid #EDE0DB', borderRadius: 10,
              fontSize: 16, fontWeight: 600, color: '#1A0A06',
              outline: 'none', fontFamily: 'inherit',
              marginBottom: 14,
            }}
            autoFocus
          />
          <button
            onClick={handleIrTakeaway}
            disabled={!pager.trim()}
            style={{
              width: '100%', background: pager.trim() ? WINE : '#E5D5D0',
              color: '#fff', border: 'none', borderRadius: 10,
              padding: '11px', fontSize: 14, fontWeight: 600,
              cursor: pager.trim() ? 'pointer' : 'default',
            }}
          >
            Abrir carta →
          </button>
        </div>
      )}

      {/* ── Delivery ── */}
      {tipo === 'Delivery' && (
        <div style={{
          background: '#fff', border: '1px solid #EDE0DB',
          borderRadius: 14, padding: '24px',
          maxWidth: 400,
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1A0A06', marginBottom: 6 }}>
            Pedido de delivery
          </div>
          <div style={{ fontSize: 12, color: '#A0786A', marginBottom: 20 }}>
            Se creará un pedido sin mesa asignada.
          </div>
          <button
            onClick={handleIrDelivery}
            style={{
              width: '100%', background: WINE,
              color: '#fff', border: 'none', borderRadius: 10,
              padding: '11px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Abrir carta →
          </button>
        </div>
      )}
    </div>
  )
}
