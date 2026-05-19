import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPedidos, getUsuarios, getCajaActiva } from '../services/api'
import ModalPedido from '../components/ModalPedido'

const WINE = '#7C2D12'

const ESTADOS = {
  2: { label: 'En cocina', bg: '#FEE2E2', color: '#991B1B' },
  3: { label: 'Listo',     bg: '#DCFCE7', color: '#166534' },
  4: { label: 'Pagado',    bg: '#F3F4F6', color: '#6B7280' },
}

function fmtPeso(val) {
  return '$' + Number(val).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function fmtHora(h) {
  return h ? String(h).slice(0, 5) : ''
}

export default function Pedidos() {
  const navigate = useNavigate()

  const [pedidosActivos, setPedidosActivos] = useState([])
  const [pedidosPagados, setPedidosPagados] = useState([])
  const [usuarios,       setUsuarios]       = useState([])
  const [caja,           setCaja]           = useState(null)
  const [filtro,         setFiltro]         = useState(null) // null=todos activos, 2=cocina, 3=listo, 4=pagados
  const [loading,        setLoading]        = useState(true)
  const [modalPedido,    setModalPedido]    = useState(null)

  const cargar = useCallback(async () => {
    try {
      const [u, cajaData] = await Promise.all([
        getUsuarios(),
        getCajaActiva(),
      ])
      setUsuarios(u)
      setCaja(cajaData)

      // Pedidos activos
      const activos = await getPedidos()
      setPedidosActivos(activos)

      // Pedidos pagados del turno
      if (cajaData?.id) {
        const pagados = await getPedidos({ caja_id: cajaData.id, pagados: true })
        setPedidosPagados(pagados)
      } else {
        const pagados = await getPedidos({ pagados: true })
        setPedidosPagados(pagados)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    cargar()
    const ws = new WebSocket('ws://localhost:8000/ws')
    ws.onmessage = () => cargar()
    return () => ws.close()
  }, [cargar])

  const getMozo = (usuarioId) => {
    const u = usuarios.find(u => u.id === usuarioId)
    return u ? `${u.nombre}` : null
  }

  const todosPedidos = [...pedidosActivos, ...pedidosPagados]

  const pedidosFiltrados = filtro === null
    ? pedidosActivos
    : filtro === 4
      ? pedidosPagados
      : filtro === 'todos'
        ? todosPedidos
        : pedidosActivos.filter(p => p.estado_id === filtro)

  const FILTROS = [
    { id: null,    label: 'Activos',   count: pedidosActivos.length },
    { id: 2,       label: 'En cocina', count: pedidosActivos.filter(p => p.estado_id === 2).length },
    { id: 3,       label: 'Listos',    count: pedidosActivos.filter(p => p.estado_id === 3).length },
    { id: 4,       label: caja ? 'Pagados del turno' : 'Pagados', count: pedidosPagados.length },
    { id: 'todos', label: 'Todos hoy', count: todosPedidos.length },
  ]

  const totalTurno = pedidosPagados.reduce((acc, p) => acc + Number(p.total), 0)

  return (
    <div style={{ padding: '28px 32px', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#1A0A06', letterSpacing: '-0.4px' }}>Pedidos</div>
          <div style={{ fontSize: 13, color: '#A0786A', marginTop: 2 }}>
            {pedidosActivos.length} activos · {pedidosPagados.length} pagados
            {caja && <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 600, color: '#166534', background: '#DCFCE7', borderRadius: 20, padding: '1px 8px' }}>turno activo</span>}
          </div>
        </div>
        <button
          onClick={() => caja?.id && navigate('/nuevo-pedido')}
          disabled={!caja?.id}
          title={!caja?.id ? 'No hay caja abierta' : ''}
          style={{ background: caja?.id ? WINE : '#E5D5D0', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: caja?.id ? 'pointer' : 'not-allowed', opacity: loading ? 0.7 : 1 }}
        >
          + Nuevo pedido
        </button>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {FILTROS.map(f => (
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

      {/* Resumen turno cuando se ve pagados */}
      {filtro === 4 && pedidosPagados.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #EDE0DB', borderRadius: 12, padding: '12px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, color: '#A0786A' }}>Total del turno</span>
          <span style={{ fontSize: 18, fontWeight: 800, color: WINE }}>{fmtPeso(totalTurno)}</span>
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <div style={{ textAlign: 'center', color: '#A0786A', fontSize: 13, padding: '48px 0' }}>Cargando...</div>
      ) : pedidosFiltrados.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#C09080', fontSize: 13, padding: '48px 0' }}>
          No hay pedidos en este filtro
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {pedidosFiltrados.map(p => {
            const est  = ESTADOS[p.estado_id] || ESTADOS[2]
            const mozo = getMozo(p.usuario_id)
            return (
              <div
                key={p.id}
                onClick={() => setModalPedido(p)}
                style={{
                  background: '#fff', border: '1px solid #EDE0DB',
                  borderRadius: 14, padding: '14px 20px',
                  display: 'flex', alignItems: 'center', gap: 14,
                  cursor: 'pointer',
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(124,45,18,0.08)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none' }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 11,
                  background: p.estado_id === 4 ? '#F3F4F6' : '#FEF2EE',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700,
                  color: p.estado_id === 4 ? '#6B7280' : WINE,
                  flexShrink: 0,
                }}>
                  {p.mesa_id ? `M${p.mesa_id}` : (p.tipo_pedido || '').slice(0, 2).toUpperCase()}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1A0A06' }}>
                    {p.mesa_id ? `Mesa ${p.mesa_id}` : p.tipo_pedido}
                    <span style={{ fontSize: 12, fontWeight: 400, color: '#A0786A', marginLeft: 8 }}>#{p.nro_pedido}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#A0786A', marginTop: 2, display: 'flex', gap: 10 }}>
                    <span>{fmtHora(p.hora)}</span>
                    {mozo && <span>👤 {mozo}</span>}
                  </div>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#1A0A06', marginBottom: 4 }}>
                    {fmtPeso(p.total)}
                  </div>
                  <div style={{ display: 'inline-block', fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 20, background: est.bg, color: est.color }}>
                    {est.label}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {modalPedido && (
        <ModalPedido
          pedido={modalPedido}
          onClose={() => setModalPedido(null)}
          onRefresh={cargar}
        />
      )}
    </div>
  )
}