import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api, { getMesas, getSalones, eliminarMesa } from '../services/api'

const WINE       = '#7C2D12'
const WINE_LIGHT = '#FEF2EE'
const MESA_W     = 88
const MESA_H     = 88
const GRID_GAP   = 24
const COLS       = 6

// Posición inicial automática para mesas sin pos_x/pos_y
function posInicial(index) {
  const col = index % COLS
  const row = Math.floor(index / COLS)
  return {
    x: GRID_GAP + col * (MESA_W + GRID_GAP),
    y: GRID_GAP + row * (MESA_H + GRID_GAP),
  }
}

function colorMesa(estado_id) {
  if (estado_id === 1) return { bg: '#F0FDF4', border: '#86EFAC', text: '#166534', dot: '#22C55E' }
  if (estado_id === 2) return { bg: WINE_LIGHT, border: '#FCA5A5', text: WINE,     dot: WINE     }
  return                       { bg: '#F3F4F6', border: '#D1D5DB', text: '#6B7280', dot: '#9CA3AF' }
}

export default function MapaMesas() {
  const [searchParams]   = useSearchParams()
  const modoNuevo        = searchParams.get('modo') === 'nuevo'
  const navigate         = useNavigate()
  const rolId            = localStorage.getItem('rol_id')
  const isAdmin          = rolId === '1'

  const [mesas,        setMesas]        = useState([])
  const [salones,      setSalones]      = useState([])
  const [salonActivo,  setSalonActivo]  = useState(null)
  const [modoEdicion,  setModoEdicion]  = useState(false)
  const [mesaHover,    setMesaHover]    = useState(null)

  // Drag state
  const dragging   = useRef(null)  // { mesaId, offsetX, offsetY }
  const canvasRef  = useRef(null)
  const posiciones = useRef({})    // { [mesaId]: { x, y } } — local durante drag

  // ── Carga ────────────────────────────────────────────────
  const cargarMesas = useCallback(async (salon_id) => {
    const data = await getMesas(salon_id)
    setMesas(data)
    // Inicializar posiciones locales
    data.forEach((m, i) => {
      if (posiciones.current[m.id] === undefined) {
        posiciones.current[m.id] = (m.pos_x != null && m.pos_y != null)
          ? { x: m.pos_x, y: m.pos_y }
          : posInicial(i)
      }
    })
  }, [])

  useEffect(() => {
    getSalones().then(data => {
      setSalones(data)
      if (data.length > 0) setSalonActivo(data[0].id)
    })
  }, [])

  useEffect(() => {
    if (salonActivo !== null) cargarMesas(salonActivo)
  }, [salonActivo, cargarMesas])

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws')
    ws.onmessage = () => { if (salonActivo !== null) cargarMesas(salonActivo) }
    return () => ws.close()
  }, [salonActivo, cargarMesas])

  // ── Drag handlers ────────────────────────────────────────
  const onMouseDown = (e, mesa) => {
    if (!modoEdicion) return
    e.preventDefault()
    const rect = canvasRef.current.getBoundingClientRect()
    const pos  = posiciones.current[mesa.id] || posInicial(0)
    dragging.current = {
      mesaId:  mesa.id,
      offsetX: e.clientX - rect.left - pos.x,
      offsetY: e.clientY - rect.top  - pos.y,
    }
  }

  const onMouseMove = (e) => {
    if (!dragging.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const { mesaId, offsetX, offsetY } = dragging.current
    const x = Math.max(0, e.clientX - rect.left - offsetX)
    const y = Math.max(0, e.clientY - rect.top  - offsetY)
    posiciones.current[mesaId] = { x, y }
    // Mover el elemento directamente en el DOM para performance
    const el = document.getElementById(`mesa-${mesaId}`)
    if (el) { el.style.left = x + 'px'; el.style.top = y + 'px' }
  }

  const onMouseUp = async () => {
    if (!dragging.current) return
    const { mesaId } = dragging.current
    dragging.current = null
    const { x, y } = posiciones.current[mesaId]
    try {
      await api.put(`/mesas/${mesaId}/posicion`, { pos_x: x, pos_y: y })
    } catch (e) {
      console.error('Error guardando posición:', e)
    }
  }

  // ── Acciones ─────────────────────────────────────────────
  const handleClickMesa = (mesa) => {
    if (modoEdicion) return
    if (modoNuevo && mesa.estado_id !== 1) {
      alert('Mesa ocupada — elegí otra')
      return
    }
    navigate(`/pedido/${mesa.id}`)
  }

  const handleEliminar = async (e, mesaId) => {
    e.stopPropagation()
    if (!window.confirm('¿Eliminar esta mesa?')) return
    await eliminarMesa(mesaId)
    cargarMesas(salonActivo)
  }

  // ── Canvas height dinámico ────────────────────────────────
  const mesasDelSalon = mesas.filter(m => m.salon_id === salonActivo)
  const canvasH = Math.max(
    480,
    ...mesasDelSalon.map(m => {
      const pos = posiciones.current[m.id] || posInicial(0)
      return pos.y + MESA_H + GRID_GAP
    })
  )

  // ── Render ───────────────────────────────────────────────
  return (
    <div style={{ padding: '28px 32px', fontFamily: "'DM Sans', sans-serif", userSelect: 'none' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#1A0A06', letterSpacing: '-0.4px' }}>Mapa de mesas</div>
          <div style={{ fontSize: 13, color: '#A0786A', marginTop: 2 }}>
            {mesasDelSalon.filter(m => m.estado_id === 2).length} ocupadas · {mesasDelSalon.filter(m => m.estado_id === 1).length} libres
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {isAdmin && (
            <button
              onClick={() => setModoEdicion(v => !v)}
              style={{
                background: modoEdicion ? WINE : '#fff',
                color:      modoEdicion ? '#fff' : '#5C3A2E',
                border:     `1px solid ${modoEdicion ? WINE : '#EDE0DB'}`,
                borderRadius: 10, padding: '8px 16px',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {modoEdicion ? '✓ Guardando posiciones' : '✎ Editar disposición'}
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => navigate('/mesas/nueva')}
              style={{
                background: WINE, color: '#fff', border: 'none',
                borderRadius: 10, padding: '8px 16px',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}
            >
              + Nueva mesa
            </button>
          )}
        </div>
      </div>

      {/* Tabs salones */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, borderBottom: '1px solid #EDE0DB', paddingBottom: 0 }}>
        {salones.map(salon => (
          <button
            key={salon.id}
            onClick={() => { posiciones.current = {}; setSalonActivo(salon.id) }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '8px 16px', fontSize: 14, fontWeight: salonActivo === salon.id ? 600 : 400,
              color: salonActivo === salon.id ? WINE : '#A0786A',
              borderBottom: salonActivo === salon.id ? `2px solid ${WINE}` : '2px solid transparent',
              marginBottom: -1, transition: 'all 0.15s',
            }}
          >
            {salon.nombre}
          </button>
        ))}
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        style={{
          position: 'relative',
          width: '100%',
          height: canvasH,
          background: modoEdicion ? '#FFFBF9' : '#fff',
          border: `1px solid ${modoEdicion ? '#FCA5A5' : '#EDE0DB'}`,
          borderRadius: 16,
          overflow: 'hidden',
          transition: 'border-color 0.2s, background 0.2s',
          // Grid pattern sutil en modo edición
          backgroundImage: modoEdicion
            ? 'radial-gradient(circle, #EDE0DB 1px, transparent 1px)'
            : 'none',
          backgroundSize: modoEdicion ? '28px 28px' : 'auto',
        }}
      >
        {modoEdicion && (
          <div style={{
            position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
            fontSize: 12, color: '#C09080', fontWeight: 500,
            background: '#fff', padding: '4px 12px', borderRadius: 20,
            border: '1px solid #EDE0DB', pointerEvents: 'none',
          }}>
            Arrastrá las mesas para reordenarlas
          </div>
        )}

        {mesasDelSalon.map((mesa, i) => {
          const pos    = posiciones.current[mesa.id] || posInicial(i)
          const colors = colorMesa(mesa.estado_id)
          const hover  = mesaHover === mesa.id

          return (
            <div
              id={`mesa-${mesa.id}`}
              key={mesa.id}
              onMouseDown={(e) => onMouseDown(e, mesa)}
              onMouseEnter={() => setMesaHover(mesa.id)}
              onMouseLeave={() => setMesaHover(null)}
              onClick={() => handleClickMesa(mesa)}
              style={{
                position: 'absolute',
                left: pos.x, top: pos.y,
                width: MESA_W, height: MESA_H,
                background: colors.bg,
                border: `2px solid ${hover ? colors.dot : colors.border}`,
                borderRadius: 14,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                cursor: modoEdicion ? 'grab' : 'pointer',
                transition: 'border-color 0.15s, box-shadow 0.15s',
                boxShadow: hover && !modoEdicion ? '0 4px 16px rgba(124,45,18,0.12)' : 'none',
              }}
            >
              {/* Dot estado */}
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: colors.dot, marginBottom: 6,
              }} />

              <div style={{ fontSize: 11, fontWeight: 600, color: colors.text, opacity: 0.7 }}>
                Mesa
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: colors.text, lineHeight: 1, letterSpacing: '-0.5px' }}>
                {mesa.nro_id}
              </div>
              <div style={{ fontSize: 10, color: colors.text, opacity: 0.6, marginTop: 3 }}>
                {mesa.capacidad} pers.
              </div>

              {/* Acciones admin en hover */}
              {hover && isAdmin && modoEdicion && (
                <div style={{
                  position: 'absolute', top: -12, right: -8,
                  display: 'flex', gap: 4,
                }}>
                  <button
                    onMouseDown={e => e.stopPropagation()}
                    onClick={(e) => { e.stopPropagation(); navigate(`/mesas/${mesa.id}/editar`) }}
                    style={{
                      width: 24, height: 24, borderRadius: 6,
                      background: '#3B82F6', color: '#fff',
                      border: 'none', fontSize: 11, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >✎</button>
                  <button
                    onMouseDown={e => e.stopPropagation()}
                    onClick={(e) => handleEliminar(e, mesa.id)}
                    style={{
                      width: 24, height: 24, borderRadius: 6,
                      background: '#EF4444', color: '#fff',
                      border: 'none', fontSize: 11, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >✕</button>
                </div>
              )}
            </div>
          )
        })}

        {mesasDelSalon.length === 0 && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            color: '#C09080', fontSize: 14, gap: 8,
          }}>
            <div style={{ fontSize: 32 }}>⊞</div>
            No hay mesas en este salón
          </div>
        )}
      </div>

      {/* Leyenda */}
      <div style={{ display: 'flex', gap: 20, marginTop: 16 }}>
        {[
          { label: 'Libre',   dot: '#22C55E' },
          { label: 'Ocupada', dot: WINE      },
        ].map(({ label, dot }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: dot }} />
            <span style={{ fontSize: 12, color: '#A0786A' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
