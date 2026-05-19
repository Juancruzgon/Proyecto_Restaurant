import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api, {
  getDetallePedido,
  getPagosParciales,
  registrarPagoParcial,
  eliminarPedido,
  imprimirComanda,
  imprimirNuevosProductos,
} from '../services/api'

const WINE       = '#7C2D12'
const WINE_LIGHT = '#FEF2EE'

const ESTADOS = {
  2: { label: 'En cocina', bg: '#FEE2E2', color: '#991B1B' },
  3: { label: 'Listo',     bg: '#DCFCE7', color: '#166534' },
  4: { label: 'Pagado',    bg: '#F3F4F6', color: '#6B7280' },
}

const TIPO_ICONS = { Salon: '🍽️', Takeaway: '🥡', Delivery: '🛵' }

const backMap = { cobro: 'main', cobrar: 'cobro', por_item: 'cobro', imprimir: 'main' }

function fmtPeso(val) {
  return '$' + Number(val).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export default function ModalPedido({ pedido: pedidoInicial, initialView = 'main', onClose, onRefresh }) {
  const navigate = useNavigate()

  const [pedidoData,  setPedidoData]  = useState(pedidoInicial)
  const [detalles,    setDetalles]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [subView,     setSubView]     = useState(initialView)

  // ── Cobro completo ──
  const [pagos,       setPagos]       = useState([{ metodo: 'efectivo', monto: '' }])
  const [errorCobro,  setErrorCobro]  = useState('')
  const [procesando,  setProcesando]  = useState(false)

  // ── Por ítem ──
  const [datosPorItem,       setDatosPorItem]       = useState(null)
  const [itemsSeleccionados, setItemsSeleccionados] = useState({})
  const [metodoPorItem,      setMetodoPorItem]      = useState('efectivo')
  const [errorPorItem,       setErrorPorItem]       = useState('')
  const [loadingPorItem,     setLoadingPorItem]     = useState(false)

  // ── Imprimir ──
  const [imprimiendo, setImprimiendo] = useState(false)
  const [msgImprimir, setMsgImprimir] = useState('')

  const cargar = async () => {
    const d = await getDetallePedido(pedidoInicial.id)
    setDetalles(d)
    const { data } = await api.get(`/pedidos/${pedidoInicial.id}`)
    setPedidoData(data)
    setLoading(false)
  }

  useEffect(() => {
    cargar()
    if (initialView === 'por_item') {
      getPagosParciales(pedidoInicial.id).then(data => {
        setDatosPorItem(data)
        setItemsSeleccionados({})
        setMetodoPorItem('efectivo')
        setErrorPorItem('')
      })
    }
  }, [])

  // ── Computed ──
  const isPagado   = pedidoData.estado_id === 4
  const hayNuevos  = detalles.some(d => d.id > (pedidoData.ultimo_detalle_impreso || 0))
  const est        = ESTADOS[pedidoData.estado_id] || ESTADOS[2]

  const tituloModal = pedidoData.mesa_id
    ? `Mesa ${pedidoData.mesa_id}`
    : pedidoData.tipo_pedido === 'Takeaway' && pedidoData.pager
      ? `Pager ${pedidoData.pager}`
      : pedidoData.tipo_pedido

  // ── Handlers ──
  const handleAgregarProductos = () => {
    if (pedidoData.mesa_id) {
      navigate(`/pedido/${pedidoData.mesa_id}?tipo=Salon`)
    } else {
      navigate(`/pedido/takeaway/${pedidoData.id}?tipo=${pedidoData.tipo_pedido}${pedidoData.pager ? `&pager=${pedidoData.pager}` : ''}`)
    }
    onClose()
  }

  const handleCancelar = async () => {
    if (!window.confirm('¿Cancelar el pedido?')) return
    await eliminarPedido(pedidoData.id)
    onRefresh()
    onClose()
  }

  const handleCobrar = async () => {
    setErrorCobro('')
    const pagosValidos = pagos.filter(p => p.monto && parseFloat(p.monto) > 0)
    if (pagosValidos.length === 0) { setErrorCobro('Ingresá al menos un monto'); return }
    const totalPagado = pagosValidos.reduce((acc, p) => acc + parseFloat(p.monto), 0)
    if (totalPagado < parseFloat(pedidoData.total)) {
      setErrorCobro(`Falta cubrir ${fmtPeso(parseFloat(pedidoData.total) - totalPagado)}`)
      return
    }
    setProcesando(true)
    try {
      await api.put(`/pedidos/${pedidoData.id}/cobrar`, {
        pagos: pagosValidos.map(p => ({ metodo: p.metodo, monto: parseFloat(p.monto) }))
      })
      onRefresh()
      onClose()
    } catch (e) {
      setErrorCobro(e.response?.data?.detail || 'Error al cobrar')
    } finally {
      setProcesando(false)
    }
  }

  const actualizarPago = (idx, field, value) => {
    setPagos(prev => { const c = [...prev]; c[idx] = { ...c[idx], [field]: value }; return c })
  }
  const eliminarPago  = (idx) => setPagos(prev => prev.filter((_, i) => i !== idx))

  const handleAbrirPorItem = async () => {
    setLoadingPorItem(true)
    try {
      const data = await getPagosParciales(pedidoData.id)
      setDatosPorItem(data)
      setItemsSeleccionados({})
      setMetodoPorItem('efectivo')
      setErrorPorItem('')
      setSubView('por_item')
    } finally {
      setLoadingPorItem(false)
    }
  }

  const toggleItem = (detalleId, cantidadPendiente) => {
    setItemsSeleccionados(prev => {
      if (prev[detalleId]) { const n = { ...prev }; delete n[detalleId]; return n }
      return { ...prev, [detalleId]: cantidadPendiente }
    })
  }

  const handleCobrarPorItem = async () => {
    setErrorPorItem('')
    const items = Object.entries(itemsSeleccionados)
      .filter(([_, cant]) => cant > 0)
      .map(([detalleId, cantidad]) => {
        const detalle = datosPorItem.detalles.find(d => d.detalle_id === parseInt(detalleId))
        const monto   = detalle ? detalle.precio_unitario * cantidad : 0
        return { detalle_id: parseInt(detalleId), cantidad, metodo: metodoPorItem, monto }
      })
    if (items.length === 0) { setErrorPorItem('Seleccioná al menos un item'); return }
    setLoadingPorItem(true)
    try {
      const result = await registrarPagoParcial(pedidoData.id, items)
      if (result.pedido_cerrado) {
        onRefresh()
        onClose()
      } else {
        const data = await getPagosParciales(pedidoData.id)
        setDatosPorItem(data)
        setItemsSeleccionados({})
      }
    } catch (e) {
      setErrorPorItem(e.response?.data?.detail || 'Error al registrar pago')
    } finally {
      setLoadingPorItem(false)
    }
  }

  const handleImprimirCompleta = async () => {
    setImprimiendo(true); setMsgImprimir('')
    try {
      await imprimirComanda(pedidoData.id)
      setMsgImprimir('✓ Comanda enviada a imprimir')
      await cargar()
    } catch (e) {
      setMsgImprimir(e.response?.data?.detail || 'Error al imprimir')
    } finally {
      setImprimiendo(false)
    }
  }

  const handleImprimirNuevos = async () => {
    if (!hayNuevos) return
    setImprimiendo(true); setMsgImprimir('')
    try {
      await imprimirNuevosProductos(pedidoData.id)
      setMsgImprimir('✓ Nuevos productos enviados')
      await cargar()
    } catch (e) {
      setMsgImprimir(e.response?.data?.detail || 'Error al imprimir')
    } finally {
      setImprimiendo(false)
    }
  }

  // ── Render helpers ──
  const Overlay = ({ children }) => (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, fontFamily: "'DM Sans', sans-serif" }}
    >
      <div style={{ background: '#fff', borderRadius: 18, width: 500, maxWidth: '95vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  )

  // ── Header ──
  const renderHeader = () => (
    <div style={{ padding: '16px 20px', borderBottom: '1px solid #EDE0DB', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexShrink: 0 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        {subView !== 'main' ? (
          <button
            onClick={() => setSubView(backMap[subView] || 'main')}
            style={{ background: 'none', border: 'none', color: WINE, fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}
          >
            ← Volver
          </button>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>{TIPO_ICONS[pedidoData.tipo_pedido] || '🍽️'}</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#1A0A06' }}>
                Pedido #{pedidoData.nro_pedido} — {tituloModal}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5 }}>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 20, background: est.bg, color: est.color }}>
                {est.label}
              </span>
              <span style={{ fontSize: 12, color: '#A0786A' }}>{String(pedidoData.hora || '').slice(0, 5)}</span>
            </div>
          </div>
        )}
      </div>
      <button onClick={onClose} style={{ background: '#F3F4F6', border: 'none', borderRadius: 8, padding: '6px 10px', fontSize: 14, cursor: 'pointer', color: '#374151', flexShrink: 0 }}>✕</button>
    </div>
  )

  // ── Main view ──
  const renderMain = () => (
    <>
      {/* Products list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#A0786A', fontSize: 13, padding: '32px 0' }}>Cargando...</div>
        ) : detalles.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#C09080', fontSize: 13, padding: '32px 0' }}>Sin productos</div>
        ) : detalles.map(d => (
          <div key={d.id} style={{ padding: '10px 20px', borderBottom: '1px solid #F5EDE8' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: '#FEF2EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: WINE }}>
                {d.cantidad}×
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1A0A06', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {d.nombre || `Producto ${d.producto_id}`}
                </div>
                {d.nota && <div style={{ fontSize: 11, color: '#D97706', marginTop: 1 }}>📝 {d.nota}</div>}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1A0A06', flexShrink: 0 }}>{fmtPeso(d.subtotal)}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      {!loading && (
        <div style={{ padding: '12px 20px', borderTop: '1px solid #EDE0DB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 13, color: '#A0786A', fontWeight: 500 }}>Total</span>
          <span style={{ fontSize: 22, fontWeight: 800, color: '#1A0A06', letterSpacing: '-0.5px' }}>{fmtPeso(pedidoData.total)}</span>
        </div>
      )}

      {/* Delivery client info */}
      {!loading && pedidoData.tipo_pedido === 'Delivery' && (pedidoData.nombre_cliente || pedidoData.telefono_cliente || pedidoData.direccion_cliente) && (
        <div style={{ margin: '0 20px 12px', fontSize: 12, color: '#5C3A2E', background: WINE_LIGHT, border: '1px solid #FCA5A5', borderRadius: 8, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
          {pedidoData.nombre_cliente    && <span>👤 {pedidoData.nombre_cliente}</span>}
          {pedidoData.telefono_cliente  && <span>📞 {pedidoData.telefono_cliente}</span>}
          {pedidoData.direccion_cliente && <span>📍 {pedidoData.direccion_cliente}</span>}
        </div>
      )}

      {/* Footer actions */}
      {!loading && (
        <div style={{ padding: '12px 20px', borderTop: '1px solid #EDE0DB', display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
          {!isPagado && (
            <button onClick={handleAgregarProductos}
              style={{ background: '#fff', color: '#1A0A06', border: '1px solid #EDE0DB', borderRadius: 10, padding: '10px', fontSize: 13, fontWeight: 600, cursor: 'pointer', width: '100%' }}>
              + Agregar productos
            </button>
          )}
          {!isPagado && (
            <button onClick={() => setSubView('cobro')}
              style={{ background: WINE, color: '#fff', border: 'none', borderRadius: 10, padding: '10px', fontSize: 13, fontWeight: 600, cursor: 'pointer', width: '100%' }}>
              💳 Cobrar
            </button>
          )}
          <button onClick={() => { setMsgImprimir(''); setSubView('imprimir') }}
            style={{ background: '#fff', color: '#5C3A2E', border: '1px solid #EDE0DB', borderRadius: 10, padding: '9px', fontSize: 13, fontWeight: 500, cursor: 'pointer', width: '100%' }}>
            🖨 Imprimir comanda
          </button>
          {!isPagado && (
            <button onClick={handleCancelar}
              style={{ background: 'none', color: '#EF4444', border: '1px solid #FECACA', borderRadius: 10, padding: '9px', fontSize: 13, fontWeight: 500, cursor: 'pointer', width: '100%' }}>
              ✕ Cancelar pedido
            </button>
          )}
        </div>
      )}
    </>
  )

  // ── Cobro choice ──
  const renderCobro = () => (
    <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#1A0A06', marginBottom: 4 }}>Cobrar pedido</div>
      <div style={{ background: '#F8F5F4', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#A0786A', marginBottom: 8 }}>
        Total: <strong style={{ color: '#1A0A06' }}>{fmtPeso(pedidoData.total)}</strong>
      </div>
      <button onClick={() => setSubView('cobrar')}
        style={{ background: WINE, color: '#fff', border: 'none', borderRadius: 12, padding: '16px', fontSize: 14, fontWeight: 600, cursor: 'pointer', width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 22 }}>💵</span>
        <div>
          <div>Pedido completo</div>
          <div style={{ fontSize: 11, fontWeight: 400, opacity: 0.8 }}>Pagar todo de una vez</div>
        </div>
      </button>
      <button onClick={handleAbrirPorItem} disabled={loadingPorItem}
        style={{ background: '#fff', color: '#1A0A06', border: '1px solid #EDE0DB', borderRadius: 12, padding: '16px', fontSize: 14, fontWeight: 600, cursor: 'pointer', width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12, opacity: loadingPorItem ? 0.7 : 1 }}>
        <span style={{ fontSize: 22 }}>👥</span>
        <div>
          <div>Cobrar por ítem</div>
          <div style={{ fontSize: 11, fontWeight: 400, color: '#A0786A' }}>Cada persona paga lo suyo</div>
        </div>
      </button>
    </div>
  )

  // ── Cobro completo form ──
  const renderCobrarCompleto = () => {
    const totalPagado = pagos.reduce((acc, p) => acc + (parseFloat(p.monto) || 0), 0)
    const diferencia  = totalPagado - parseFloat(pedidoData.total)
    return (
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#1A0A06', marginBottom: 4 }}>Cobrar pedido completo</div>
        <div style={{ fontSize: 13, color: '#A0786A', marginBottom: 18 }}>
          Total: <strong style={{ color: '#1A0A06' }}>{fmtPeso(pedidoData.total)}</strong>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          {pagos.map((p, i) => {
            const cubierto = pagos.reduce((acc, x, xi) => xi !== i ? acc + (parseFloat(x.monto) || 0) : acc, 0)
            const restante = Math.max(0, parseFloat(pedidoData.total) - cubierto)
            return (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 6, flex: 1 }}>
                  {['efectivo', 'tarjeta', 'qr'].map(m => (
                    <button key={m} onClick={() => actualizarPago(i, 'metodo', m)}
                      style={{ flex: 1, padding: '7px 4px', borderRadius: 8, cursor: 'pointer', border: `1px solid ${p.metodo === m ? WINE : '#EDE0DB'}`, background: p.metodo === m ? WINE_LIGHT : '#fff', color: p.metodo === m ? WINE : '#5C3A2E', fontSize: 10, fontWeight: p.metodo === m ? 600 : 400 }}>
                      {m === 'efectivo' ? '💵' : m === 'tarjeta' ? '💳' : '📱'} {m.charAt(0).toUpperCase() + m.slice(1)}
                    </button>
                  ))}
                </div>
                <input type="number" value={p.monto}
                  onChange={e => actualizarPago(i, 'monto', e.target.value)}
                  onFocus={() => { if (!p.monto && restante > 0) actualizarPago(i, 'monto', restante.toFixed(0)) }}
                  placeholder="Monto"
                  style={{ width: 90, padding: '8px 10px', border: '1px solid #EDE0DB', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'inherit', color: '#1A0A06' }}
                />
                {pagos.length > 1 && (
                  <button onClick={() => eliminarPago(i)} style={{ background: '#FEF2F2', color: '#EF4444', border: 'none', borderRadius: 7, padding: '7px 9px', fontSize: 12, cursor: 'pointer' }}>✕</button>
                )}
              </div>
            )
          })}
        </div>
        {pagos.length < 3 && (
          <button onClick={() => setPagos(prev => [...prev, { metodo: 'efectivo', monto: '' }])}
            style={{ width: '100%', background: 'none', border: '1px dashed #EDE0DB', borderRadius: 9, padding: '8px', fontSize: 12, color: '#A0786A', cursor: 'pointer', marginBottom: 14 }}>
            + Agregar otro método de pago
          </button>
        )}
        <div style={{ background: '#F8F5F4', borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#1A0A06', marginBottom: diferencia !== 0 ? 6 : 0 }}>
            <span>Total cobrado</span><span style={{ fontWeight: 700 }}>{fmtPeso(totalPagado)}</span>
          </div>
          {diferencia > 0 && pagos.some(p => p.metodo === 'efectivo') && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#166534', fontWeight: 600 }}>
              <span>Vuelto</span><span>{fmtPeso(diferencia)}</span>
            </div>
          )}
          {diferencia < 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#EF4444', fontWeight: 600 }}>
              <span>Falta cubrir</span><span>{fmtPeso(Math.abs(diferencia))}</span>
            </div>
          )}
        </div>
        {errorCobro && (
          <div style={{ fontSize: 12, color: '#EF4444', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '8px 12px', marginBottom: 12 }}>
            {errorCobro}
          </div>
        )}
        <button onClick={handleCobrar} disabled={procesando}
          style={{ width: '100%', background: WINE, color: '#fff', border: 'none', borderRadius: 10, padding: '12px', fontSize: 13, fontWeight: 600, cursor: procesando ? 'default' : 'pointer', opacity: procesando ? 0.7 : 1 }}>
          {procesando ? 'Procesando...' : '✓ Confirmar cobro'}
        </button>
      </div>
    )
  }

  // ── Por ítem ──
  const renderPorItem = () => {
    if (!datosPorItem) return <div style={{ padding: 24, textAlign: 'center', color: '#A0786A' }}>Cargando...</div>
    return (
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#1A0A06', marginBottom: 4 }}>Pago por ítem</div>
        <div style={{ fontSize: 13, color: '#A0786A', marginBottom: 16 }}>Seleccioná los items que va a pagar esta persona</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {[['total_pedido', 'Total pedido', '#1A0A06', '#F8F5F4'], ['total_pagado', 'Ya pagado', '#166534', '#DCFCE7'], ['total_pendiente', 'Pendiente', WINE, WINE_LIGHT]].map(([k, l, c, bg]) => (
            <div key={k} style={{ flex: 1, background: bg, borderRadius: 10, padding: '8px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: '#A0786A', marginBottom: 2 }}>{l}</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: c }}>{fmtPeso(datosPorItem[k])}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {datosPorItem.detalles.map(d => {
            const seleccionado = !!itemsSeleccionados[d.detalle_id]
            const pendiente    = d.cantidad_pendiente
            if (pendiente === 0) return (
              <div key={d.detalle_id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#F3F4F6', borderRadius: 10, opacity: 0.5 }}>
                <span style={{ fontSize: 14 }}>✓</span>
                <div style={{ flex: 1, fontSize: 13, color: '#6B7280' }}>{d.nombre}</div>
                <div style={{ fontSize: 12, color: '#6B7280' }}>Pagado</div>
              </div>
            )
            return (
              <div key={d.detalle_id} onClick={() => toggleItem(d.detalle_id, pendiente)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, cursor: 'pointer', border: `2px solid ${seleccionado ? WINE : '#EDE0DB'}`, background: seleccionado ? WINE_LIGHT : '#fff', transition: 'all 0.15s' }}>
                <div style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, border: `2px solid ${seleccionado ? WINE : '#EDE0DB'}`, background: seleccionado ? WINE : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {seleccionado && <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>✓</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1A0A06' }}>{d.nombre}</div>
                  <div style={{ fontSize: 11, color: '#A0786A', marginTop: 1 }}>
                    {d.cantidad_pagada > 0 ? `${pendiente} de ${d.cantidad_total} pendiente(s)` : `${d.cantidad_total} unidad(es)`}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1A0A06' }}>{fmtPeso(d.precio_unitario * pendiente)}</div>
                  {seleccionado && pendiente > 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, justifyContent: 'flex-end' }}>
                      <button onClick={e => { e.stopPropagation(); setItemsSeleccionados(prev => ({ ...prev, [d.detalle_id]: Math.max(1, (prev[d.detalle_id] || 1) - 1) })) }}
                        style={{ width: 20, height: 20, borderRadius: 5, background: '#F5EDE8', border: 'none', fontSize: 12, cursor: 'pointer', color: WINE }}>−</button>
                      <span style={{ fontSize: 12, fontWeight: 700, color: WINE, minWidth: 14, textAlign: 'center' }}>{itemsSeleccionados[d.detalle_id] || pendiente}</span>
                      <button onClick={e => { e.stopPropagation(); setItemsSeleccionados(prev => ({ ...prev, [d.detalle_id]: Math.min(pendiente, (prev[d.detalle_id] || 1) + 1) })) }}
                        style={{ width: 20, height: 20, borderRadius: 5, background: WINE_LIGHT, border: 'none', fontSize: 12, cursor: 'pointer', color: WINE }}>+</button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#A0786A', marginBottom: 8 }}>Método de pago</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['efectivo', 'tarjeta', 'qr'].map(m => (
              <button key={m} onClick={() => setMetodoPorItem(m)}
                style={{ flex: 1, padding: '8px', borderRadius: 9, cursor: 'pointer', border: `1px solid ${metodoPorItem === m ? WINE : '#EDE0DB'}`, background: metodoPorItem === m ? WINE_LIGHT : '#fff', color: metodoPorItem === m ? WINE : '#5C3A2E', fontSize: 12, fontWeight: metodoPorItem === m ? 600 : 400 }}>
                {m === 'efectivo' ? '💵 Efectivo' : m === 'tarjeta' ? '💳 Tarjeta' : '📱 QR'}
              </button>
            ))}
          </div>
        </div>
        {Object.keys(itemsSeleccionados).length > 0 && (
          <div style={{ background: '#F8F5F4', borderRadius: 10, padding: '10px 14px', marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#A0786A' }}>A cobrar ahora</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#1A0A06' }}>
              {fmtPeso(Object.entries(itemsSeleccionados).reduce((acc, [id, cant]) => {
                const d = datosPorItem.detalles.find(x => x.detalle_id === parseInt(id))
                return acc + (d ? d.precio_unitario * cant : 0)
              }, 0))}
            </span>
          </div>
        )}
        {errorPorItem && (
          <div style={{ fontSize: 12, color: '#EF4444', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '8px 12px', marginBottom: 12 }}>
            {errorPorItem}
          </div>
        )}
        <button onClick={handleCobrarPorItem} disabled={loadingPorItem || Object.keys(itemsSeleccionados).length === 0}
          style={{ width: '100%', background: Object.keys(itemsSeleccionados).length > 0 ? WINE : '#E5D5D0', color: '#fff', border: 'none', borderRadius: 10, padding: '12px', fontSize: 13, fontWeight: 600, cursor: Object.keys(itemsSeleccionados).length > 0 ? 'pointer' : 'default' }}>
          {loadingPorItem ? 'Procesando...' : '✓ Cobrar seleccionados'}
        </button>
      </div>
    )
  }

  // ── Imprimir ──
  const renderImprimir = () => (
    <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#1A0A06', marginBottom: 4 }}>Imprimir comanda</div>
      {msgImprimir && (
        <div style={{ fontSize: 13, color: '#166534', background: '#DCFCE7', border: '1px solid #86EFAC', borderRadius: 8, padding: '8px 12px' }}>
          {msgImprimir}
        </div>
      )}
      <button onClick={handleImprimirCompleta} disabled={imprimiendo}
        style={{ background: '#fff', color: '#1A0A06', border: '1px solid #EDE0DB', borderRadius: 12, padding: '16px', fontSize: 14, fontWeight: 600, cursor: 'pointer', width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12, opacity: imprimiendo ? 0.7 : 1 }}>
        <span style={{ fontSize: 22 }}>📄</span>
        <div>
          <div>Comanda completa</div>
          <div style={{ fontSize: 11, fontWeight: 400, color: '#A0786A' }}>Imprime todos los productos</div>
        </div>
      </button>
      <button onClick={handleImprimirNuevos} disabled={imprimiendo || !hayNuevos}
        title={!hayNuevos ? 'No hay productos nuevos' : ''}
        style={{ background: hayNuevos ? '#FFFBEB' : '#F9FAFB', color: hayNuevos ? '#854D0E' : '#9CA3AF', border: `1px solid ${hayNuevos ? '#FDE68A' : '#E5E7EB'}`, borderRadius: 12, padding: '16px', fontSize: 14, fontWeight: 600, cursor: hayNuevos && !imprimiendo ? 'pointer' : 'not-allowed', width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12, opacity: imprimiendo ? 0.7 : 1 }}>
        <span style={{ fontSize: 22 }}>📝</span>
        <div>
          <div>Nuevo detalle</div>
          <div style={{ fontSize: 11, fontWeight: 400 }}>
            {hayNuevos ? 'Solo productos agregados después de la última impresión' : 'No hay productos nuevos para imprimir'}
          </div>
        </div>
      </button>
    </div>
  )

  return (
    <Overlay>
      {renderHeader()}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {subView === 'main'    && renderMain()}
        {subView === 'cobro'   && renderCobro()}
        {subView === 'cobrar'  && renderCobrarCompleto()}
        {subView === 'por_item' && renderPorItem()}
        {subView === 'imprimir' && renderImprimir()}
      </div>
    </Overlay>
  )
}
