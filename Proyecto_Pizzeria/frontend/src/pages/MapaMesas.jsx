import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api, { getMesas, getSalones, eliminarMesa, getCajaActiva } from '../services/api'

const WINE       = '#7C2D12'
const WINE_LIGHT = '#FEF2EE'
const MESA_MIN   = 72
const MESA_DEF   = 88
const GRID_GAP   = 24
const COLS       = 6

function posInicial(index) {
  const col = index % COLS
  const row = Math.floor(index / COLS)
  return {
    x: GRID_GAP + col * (MESA_DEF + GRID_GAP),
    y: GRID_GAP + row * (MESA_DEF + GRID_GAP),
  }
}

function colorMesa(estado_id) {
  if (estado_id === 1) return { bg: '#F0FDF4', border: '#86EFAC', text: '#166534', dot: '#22C55E' }
  if (estado_id === 2) return { bg: WINE_LIGHT, border: '#FCA5A5', text: WINE, dot: WINE }
  return { bg: '#F3F4F6', border: '#D1D5DB', text: '#6B7280', dot: '#9CA3AF' }
}

export default function MapaMesas() {
  const [searchParams] = useSearchParams()
  const modoNuevo      = searchParams.get('modo') === 'nuevo'
  const navigate       = useNavigate()
  const rolId          = localStorage.getItem('rol_id')
  const isAdmin        = rolId === '1'

  const [mesas,       setMesas]       = useState([])
  const [salones,     setSalones]     = useState([])
  const [salonActivo, setSalonActivo] = useState(null)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [mesaHover,   setMesaHover]   = useState(null)
  const [caja,        setCaja]        = useState(null)

  // Tamaño del canvas (salón)
  const [canvasW, setCanvasW] = useState(1200)
  const [canvasH, setCanvasH] = useState(600)
  
  // Ref en tiempo real para evitar closures viejos en el onMouseUp
  const currentCanvasRef = useRef({ w: 1200, h: 600 })

  const dragging      = useRef(null)
  const resizingMesa  = useRef(null)
  const resizingSalon = useRef(null) // { startX, startY, startW, startH }
  const canvasRef     = useRef(null)
  const posiciones    = useRef({})
  const tamanios      = useRef({})

  const cargarMesas = useCallback(async (salon_id) => {
    const data = await getMesas(salon_id)
    setMesas(data)
    data.forEach((m, i) => {
      if (posiciones.current[m.id] === undefined) {
        posiciones.current[m.id] = (m.pos_x != null && m.pos_y != null)
          ? { x: m.pos_x, y: m.pos_y }
          : posInicial(i)
      }
      if (tamanios.current[m.id] === undefined) {
        tamanios.current[m.id] = { w: m.ancho || MESA_DEF, h: m.alto || MESA_DEF }
      }
    })
  }, [])

  const cargarSalon = useCallback((salonId, salonesData) => {
    const salon = salonesData.find(s => s.id === salonId)
    if (salon) {
      const w = salon.ancho || 1200
      const h = salon.alto || 600
      setCanvasW(w)
      setCanvasH(h)
      currentCanvasRef.current = { w, h } // Sincronizamos la Ref
    }
  }, [])

  useEffect(() => {
    getSalones().then(data => {
      setSalones(data)
      if (data.length > 0) {
        setSalonActivo(data[0].id)
        cargarSalon(data[0].id, data)
      }
    })
    getCajaActiva().then(data => setCaja(data)).catch(() => setCaja(null))
  }, [cargarSalon])

  useEffect(() => {
    if (salonActivo !== null) cargarMesas(salonActivo)
  }, [salonActivo, cargarMesas])

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws')
    ws.onmessage = () => { if (salonActivo !== null) cargarMesas(salonActivo) }
    return () => ws.close()
  }, [salonActivo, cargarMesas])

  // ── Drag mesa ────────────────────────────────────────────
  const onMouseDown = (e, mesa) => {
    if (!modoEdicion) return
    if (e.target.dataset.resize) return
    e.preventDefault()
    const rect = canvasRef.current.getBoundingClientRect()
    const pos  = posiciones.current[mesa.id] || posInicial(0)
    dragging.current = {
      mesaId:  mesa.id,
      offsetX: e.clientX - rect.left - pos.x,
      offsetY: e.clientY - rect.top  - pos.y,
    }
  }

  // ── Resize mesa ──────────────────────────────────────────
  const onResizeMesaDown = (e, mesa) => {
    e.preventDefault()
    e.stopPropagation()
    const tam = tamanios.current[mesa.id] || { w: MESA_DEF, h: MESA_DEF }
    resizingMesa.current = {
      mesaId: mesa.id,
      startX: e.clientX, startY: e.clientY,
      startW: tam.w,     startH: tam.h,
    }
  }

  // ── Resize salón ─────────────────────────────────────────
  const onResizeSalonDown = (e) => {
    e.preventDefault()
    e.stopPropagation()
    resizingSalon.current = {
      startX: e.clientX, startY: e.clientY,
      startW: currentCanvasRef.current.w,
      startH: currentCanvasRef.current.h,
    }
  }

  // ── Mouse move global ────────────────────────────────────
  const onMouseMove = (e) => {
    if (dragging.current && !resizingMesa.current && !resizingSalon.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      const { mesaId, offsetX, offsetY } = dragging.current
      const tam = tamanios.current[mesaId] || { w: MESA_DEF, h: MESA_DEF }
      const x = Math.min(Math.max(0, e.clientX - rect.left - offsetX), currentCanvasRef.current.w - tam.w)
      const y = Math.min(Math.max(0, e.clientY - rect.top  - offsetY), currentCanvasRef.current.h - tam.h)
      posiciones.current[mesaId] = { x, y }
      const el = document.getElementById(`mesa-${mesaId}`)
      if (el) { el.style.left = x + 'px'; el.style.top = y + 'px' }
    }

    if (resizingMesa.current) {
      const { mesaId, startX, startY, startW, startH } = resizingMesa.current
      const w = Math.max(MESA_MIN, startW + e.clientX - startX)
      const h = Math.max(MESA_MIN, startH + e.clientY - startY)
      tamanios.current[mesaId] = { w, h }
      const el = document.getElementById(`mesa-${mesaId}`)
      if (el) { el.style.width = w + 'px'; el.style.height = h + 'px' }
    }

    if (resizingSalon.current) {
      const { startX, startY, startW, startH } = resizingSalon.current
      const newW = Math.max(400, startW + e.clientX - startX)
      const newH = Math.max(300, startH + e.clientY - startY)
      
      // Actualizamos estado visual y la Ref en simultáneo
      setCanvasW(newW)
      setCanvasH(newH)
      currentCanvasRef.current = { w: newW, h: newH }
    }
  }

  // ── Mouse up — guardar ───────────────────────────────────
  const onMouseUp = async () => {
    if (dragging.current) {
      const { mesaId } = dragging.current
      dragging.current = null
      const { x, y } = posiciones.current[mesaId]
      try { await api.put(`/mesas/${mesaId}/posicion`, { pos_x: x, pos_y: y }) }
      catch (e) { console.error(e) }
    }

    if (resizingMesa.current) {
      const { mesaId } = resizingMesa.current
      resizingMesa.current = null
      const { w, h } = tamanios.current[mesaId]
      try { await api.put(`/mesas/${mesaId}`, { ancho: w, alto: h }) }
      catch (e) { console.error(e) }
    }

    if (resizingSalon.current) {
      resizingSalon.current = null
      const finalW = currentCanvasRef.current.w
      const finalH = currentCanvasRef.current.h
      
      try {
        await api.put(`/salones/${salonActivo}`, { ancho: finalW, alto: finalH })
        // Acá actualizamos el array para que al cambiar de tab no se borre
        setSalones(prev => prev.map(s => s.id === salonActivo ? { ...s, ancho: finalW, alto: finalH } : s))
      }
      catch (e) { console.error(e) }
    }
  }

  const handleClickMesa = (mesa) => {
    if (modoEdicion) return
    if (!caja?.id) { alert('No hay caja abierta. Pedí al admin que abra la caja para comenzar a operar.'); return }
    if (modoNuevo && mesa.estado_id !== 1) { alert('Mesa ocupada — elegí otra'); return }
    navigate(`/pedido/${mesa.id}?tipo=Salon`)
  }

  const handleEliminar = async (e, mesaId) => {
    e.stopPropagation()
    if (!window.confirm('¿Eliminar esta mesa?')) return
    await eliminarMesa(mesaId)
    cargarMesas(salonActivo)
  }

  const mesasDelSalon = mesas.filter(m => m.salon_id === salonActivo)

  return (
    <div
      style={{ padding: '28px 32px', fontFamily: "'DM Sans', sans-serif", userSelect: 'none' }}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
    >

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#1A0A06', letterSpacing: '-0.4px' }}>Mapa de mesas</div>
          <div style={{ fontSize: 13, color: '#A0786A', marginTop: 2 }}>
            {mesasDelSalon.filter(m => m.estado_id === 2).length} ocupadas · {mesasDelSalon.filter(m => m.estado_id === 1).length} libres
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {isAdmin && (
            <button
              onClick={() => setModoEdicion(v => !v)}
              style={{
                background: modoEdicion ? WINE : '#fff',
                color:      modoEdicion ? '#fff' : '#5C3A2E',
                border:     `1px solid ${modoEdicion ? WINE : '#EDE0DB'}`,
                borderRadius: 10, padding: '8px 16px',
                fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {modoEdicion ? '✓ Listo' : '✎ Editar disposición'}
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => navigate('/mesas/nueva')}
              style={{ background: WINE, color: '#fff', border: 'none', borderRadius: 10, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              + Nueva mesa
            </button>
          )}
        </div>
      </div>

      {/* Tabs salones */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, borderBottom: '1px solid #EDE0DB' }}>
        {salones.map(salon => (
          <button
            key={salon.id}
            onClick={() => {
              posiciones.current = {}
              tamanios.current   = {}
              setSalonActivo(salon.id)
              cargarSalon(salon.id, salones)
            }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '8px 16px', fontSize: 14,
              fontWeight: salonActivo === salon.id ? 600 : 400,
              color: salonActivo === salon.id ? WINE : '#A0786A',
              borderBottom: salonActivo === salon.id ? `2px solid ${WINE}` : '2px solid transparent',
              marginBottom: -1, transition: 'all 0.15s',
            }}
          >
            {salon.nombre}
          </button>
        ))}
      </div>

      {/* Canvas salón */}
      <div style={{ position: 'relative', display: 'inline-block', minWidth: '100%' }}>
        <div
          ref={canvasRef}
          style={{
            position: 'relative',
            width: canvasW, height: canvasH,
            background: modoEdicion ? '#FFFBF9' : '#fff',
            border: `1px solid ${modoEdicion ? '#FCA5A5' : '#EDE0DB'}`,
            borderRadius: 16, overflow: 'hidden',
            transition: 'border-color 0.2s, background 0.2s',
            backgroundImage: modoEdicion ? 'radial-gradient(circle, #EDE0DB 1px, transparent 1px)' : 'none',
            backgroundSize: modoEdicion ? '28px 28px' : 'auto',
          }}
        >
          {modoEdicion && (
            <div style={{
              position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
              fontSize: 12, color: '#C09080', fontWeight: 500,
              background: '#fff', padding: '4px 12px', borderRadius: 20,
              border: '1px solid #EDE0DB', pointerEvents: 'none', zIndex: 10, whiteSpace: 'nowrap',
            }}>
              Mover mesas · ↘ para redimensionar mesa · Esquina del salón para agrandar/achicar
            </div>
          )}

          {mesasDelSalon.map((mesa, i) => {
            const pos    = posiciones.current[mesa.id] || posInicial(i)
            const tam    = tamanios.current[mesa.id]   || { w: MESA_DEF, h: MESA_DEF }
            const colors = colorMesa(mesa.estado_id)
            const hover  = mesaHover === mesa.id

            return (
              <div
                id={`mesa-${mesa.id}`}
                key={mesa.id}
                onMouseDown={e => onMouseDown(e, mesa)}
                onMouseEnter={() => setMesaHover(mesa.id)}
                onMouseLeave={() => setMesaHover(null)}
                onClick={() => handleClickMesa(mesa)}
                style={{
                  position: 'absolute',
                  left: pos.x, top: pos.y,
                  width: tam.w, height: tam.h,
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
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: colors.dot, marginBottom: 6 }} />
                <div style={{ fontSize: 11, fontWeight: 600, color: colors.text, opacity: 0.7 }}>Mesa</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: colors.text, lineHeight: 1, letterSpacing: '-0.5px' }}>{mesa.nro_id}</div>
                <div style={{ fontSize: 10, color: colors.text, opacity: 0.6, marginTop: 3 }}>{mesa.capacidad} pers.</div>

                {hover && isAdmin && modoEdicion && (
                  <div style={{ position: 'absolute', top: -12, right: -8, display: 'flex', gap: 4, zIndex: 5 }}>
                    <button
                      onMouseDown={e => e.stopPropagation()}
                      onClick={e => { e.stopPropagation(); navigate(`/mesas/${mesa.id}/editar`) }}
                      style={{ width: 24, height: 24, borderRadius: 6, background: '#3B82F6', color: '#fff', border: 'none', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >✎</button>
                    <button
                      onMouseDown={e => e.stopPropagation()}
                      onClick={e => handleEliminar(e, mesa.id)}
                      style={{ width: 24, height: 24, borderRadius: 6, background: '#EF4444', color: '#fff', border: 'none', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >✕</button>
                  </div>
                )}

                {modoEdicion && (
                  <div
                    data-resize="true"
                    onMouseDown={e => onResizeMesaDown(e, mesa)}
                    style={{ position: 'absolute', bottom: 3, right: 3, width: 14, height: 14, cursor: 'nwse-resize', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M9 1L1 9M9 5L5 9" stroke={colors.dot} strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                )}
              </div>
            )
          })}

          {mesasDelSalon.length === 0 && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#C09080', fontSize: 14, gap: 8 }}>
              <div style={{ fontSize: 32 }}>⊞</div>
              No hay mesas en este salón
            </div>
          )}
        </div>

        {/* Handle resize salón — esquina inferior derecha */}
        {modoEdicion && (
          <div
            onMouseDown={onResizeSalonDown}
            style={{
              position: 'absolute', bottom: -6, right: -6,
              width: 20, height: 20,
              background: WINE, borderRadius: '50%',
              cursor: 'nwse-resize', zIndex: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M9 1L1 9M9 5L5 9M5 9L1 9" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        )}
      </div>

      {/* Leyenda */}
      <div style={{ display: 'flex', gap: 20, marginTop: 20 }}>
        {[{ label: 'Libre', dot: '#22C55E' }, { label: 'Ocupada', dot: WINE }].map(({ label, dot }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: dot }} />
            <span style={{ fontSize: 12, color: '#A0786A' }}>{label}</span>
          </div>
        ))}
        {modoEdicion && (
          <span style={{ fontSize: 12, color: '#A0786A' }}>· Círculo rojo ↘ para redimensionar el salón</span>
        )}
      </div>
    </div>
  )
}