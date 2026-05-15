import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import {
  getPedidosPorMesa, getDetallePedido, getProductos,
  cambiarEstadoPedido, eliminarDetalle, agregarDetalle,
  getCategorias, eliminarPedido, getUsuarioPorId,
  modificarCantidad, modificarNota, imprimirComanda, imprimirTicket,
  getPagosParciales, registrarPagoParcial, imprimirNuevosProductos
} from '../services/api'
import api from '../services/api'

const WINE       = '#7C2D12'
const WINE_LIGHT = '#FEF2EE'

const ESTADOS = {
  2: { label: 'En cocina', bg: '#FEE2E2', color: '#991B1B' },
  3: { label: 'Listo',     bg: '#DCFCE7', color: '#166534' },
  4: { label: 'Pagado',    bg: '#F3F4F6', color: '#6B7280' },
}

const TIPO_ICONS = { Salon: '🍽️', Takeaway: '🥡', Delivery: '🛵' }

function fmtPeso(val) {
  return '$' + Number(val).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export default function Pedido() {
  const { mesaId, pedidoId } = useParams()
  const [searchParams]       = useSearchParams()
  const navigate             = useNavigate()
  const usuarioId            = localStorage.getItem('usuario_id')

  const tipoPedido = searchParams.get('tipo') || 'Salon'
  const pagerParam = searchParams.get('pager') || null
  const esSalon    = tipoPedido === 'Salon' && mesaId && mesaId !== 'nuevo'

  const [pedido,   setPedido]   = useState(null)
  const [detalles, setDetalles] = useState([])
  const [mozo,     setMozo]     = useState(null)

  const [categorias,    setCategorias]    = useState([])
  const [subcategorias, setSubcategorias] = useState([])
  const [catRaiz,       setCatRaiz]       = useState(null)
  const [catActiva,     setCatActiva]     = useState(null)
  const [productos,     setProductos]     = useState([])
  const [buscador,      setBuscador]      = useState('')
  const [itemsTemp,     setItemsTemp]     = useState([])

  const [notaActiva,          setNotaActiva]          = useState(null)
  const [notaInput,           setNotaInput]           = useState('')
  const [imprimiendo,         setImprimiendo]         = useState(false)
  const [mostrarModalCobro,   setMostrarModalCobro]   = useState(false)
  const [pagos,               setPagos]               = useState([{ metodo: 'efectivo', monto: '' }])
  const [errorCobro,          setErrorCobro]          = useState('')
  const [mostrarModalPorItem, setMostrarModalPorItem] = useState(false)
  const [datosPorItem,        setDatosPorItem]        = useState(null)
  const [itemsSeleccionados,  setItemsSeleccionados]  = useState({})
  const [metodoPorItem,       setMetodoPorItem]       = useState('efectivo')
  const [loadingPorItem,      setLoadingPorItem]      = useState(false)
  const [errorPorItem,        setErrorPorItem]        = useState('')

  const cargarPedido = useCallback(async () => {
    if (pedidoId) {
      const { data } = await api.get(`/pedidos/${pedidoId}`)
      setPedido(data)
      const d = await getDetallePedido(data.id)
      setDetalles(d)
      if (data.usuario_id) {
        const u = await getUsuarioPorId(data.usuario_id)
        setMozo(u)
      }
      return
    }
    if (!esSalon) return
    const data = await getPedidosPorMesa(mesaId)
    if (data.length > 0) {
      const p = data[0]
      setPedido(p)
      const d = await getDetallePedido(p.id)
      setDetalles(d)
      if (p.usuario_id) {
        const u = await getUsuarioPorId(p.usuario_id)
        setMozo(u)
      }
    } else {
      setPedido(null); setDetalles([]); setMozo(null)
    }
  }, [mesaId, pedidoId, esSalon])

  useEffect(() => {
    getCategorias().then(data => {
      setCategorias(data)
      if (data.length > 0) { setCatRaiz(data[0].id); setCatActiva(data[0].id) }
    })
    cargarPedido()
    const ws = new WebSocket('ws://localhost:8000/ws')
    ws.onmessage = () => cargarPedido()
    return () => ws.close()
  }, [mesaId, pedidoId, cargarPedido])

  useEffect(() => {
    if (!catRaiz) return
    getCategorias(catRaiz).then(subs => {
      setSubcategorias(subs)
      setCatActiva(subs.length > 0 ? subs[0].id : catRaiz)
    })
  }, [catRaiz])

  useEffect(() => {
    if (!catActiva) return
    getProductos(catActiva).then(data => setProductos(data.filter(p => p.activo)))
  }, [catActiva])

  const cantidadEnPedido = (productoId) => {
    if (pedido) return detalles.find(d => d.producto_id === productoId)?.cantidad || 0
    return itemsTemp.find(i => i.producto_id === productoId)?.cantidad || 0
  }

  const productosFiltrados = buscador.trim()
    ? productos.filter(p => p.nombre.toLowerCase().includes(buscador.toLowerCase()))
    : productos

  const handleAgregar = async (producto) => {
    if (pedido) {
      const detalle = detalles.find(d => d.producto_id === producto.id)
      detalle
        ? await modificarCantidad(pedido.id, detalle.id, detalle.cantidad + 1)
        : await agregarDetalle(pedido.id, producto.id, 1)
      cargarPedido()
    } else {
      setItemsTemp(prev => {
        const idx = prev.findIndex(i => i.producto_id === producto.id)
        if (idx >= 0) { const c = [...prev]; c[idx] = { ...c[idx], cantidad: c[idx].cantidad + 1 }; return c }
        return [...prev, { producto_id: producto.id, cantidad: 1, nombre: producto.nombre, precio: producto.precio, nota: '' }]
      })
    }
  }

  const handleRestar = async (productoId) => {
    if (pedido) {
      const detalle = detalles.find(d => d.producto_id === productoId)
      if (!detalle) return
      detalle.cantidad <= 1
        ? await eliminarDetalle(pedido.id, detalle.id)
        : await modificarCantidad(pedido.id, detalle.id, detalle.cantidad - 1)
      cargarPedido()
    } else {
      setItemsTemp(prev => {
        const idx = prev.findIndex(i => i.producto_id === productoId)
        if (idx < 0) return prev
        if (prev[idx].cantidad <= 1) return prev.filter((_, i) => i !== idx)
        const c = [...prev]; c[idx] = { ...c[idx], cantidad: c[idx].cantidad - 1 }; return c
      })
    }
  }

  const handleAbrirNota = (key, valorActual) => {
    setNotaActiva(key)
    setNotaInput(valorActual || '')
  }

  const handleGuardarNota = async (key) => {
    if (typeof key === 'number') {
      await modificarNota(pedido.id, key, notaInput || null)
      cargarPedido()
    } else {
      const idx = parseInt(key.replace('temp_', ''))
      setItemsTemp(prev => {
        const c = [...prev]
        c[idx] = { ...c[idx], nota: notaInput || '' }
        return c
      })
    }
    setNotaActiva(null)
  }

  const handleCrearPedido = async () => {
    if (itemsTemp.length === 0) return
    const { data: nuevo } = await api.post('/pedidos/', {
      tipo_pedido: tipoPedido,
      usuario_id:  parseInt(usuarioId),
      mesa_id:     esSalon ? parseInt(mesaId) : null,
      pager:       tipoPedido === 'Takeaway' ? pagerParam : null,
    })
    for (const i of itemsTemp) {
      await agregarDetalle(nuevo.id, i.producto_id, i.cantidad, i.nota || null)
    }
    setItemsTemp([])
    // Imprimir comanda con todos los productos (también actualiza ultimo_detalle_impreso)
    try { await imprimirComanda(nuevo.id) } catch (e) { console.error(e) }
    setPedido(nuevo)
    const d = await getDetallePedido(nuevo.id)
    setDetalles(d)
    // Recargar pedido para obtener ultimo_detalle_impreso actualizado
    const { data: pedidoActualizado } = await api.get(`/pedidos/${nuevo.id}`)
    setPedido(pedidoActualizado)
  }

  const handleAvanzarEstado = async () => {
    if (!pedido) return
    await cambiarEstadoPedido(pedido.id)
    cargarPedido()
  }

  const handleCobrar = async () => {
    setErrorCobro('')
    const pagosValidos = pagos.filter(p => p.monto && parseFloat(p.monto) > 0)
    if (pagosValidos.length === 0) { setErrorCobro('Ingresá al menos un monto'); return }
    const totalPagado = pagosValidos.reduce((acc, p) => acc + parseFloat(p.monto), 0)
    if (totalPagado < parseFloat(pedido.total)) {
      setErrorCobro(`Falta cubrir ${fmtPeso(parseFloat(pedido.total) - totalPagado)}`)
      return
    }
    setImprimiendo(true)
    try {
      await api.put(`/pedidos/${pedido.id}/cobrar`, {
        pagos: pagosValidos.map(p => ({ metodo: p.metodo, monto: parseFloat(p.monto) }))
      })
      try { await imprimirTicket(pedido.id) } catch (e) { console.error(e) }
      navigate(esSalon ? '/mesas' : '/pedidos')
    } catch (e) {
      setErrorCobro(e.response?.data?.detail || 'Error al cobrar')
    } finally {
      setImprimiendo(false)
    }
  }

  const agregarMetodoPago = () => setPagos(prev => [...prev, { metodo: 'efectivo', monto: '' }])

  const actualizarPago = (idx, field, value) => {
    setPagos(prev => { const c = [...prev]; c[idx] = { ...c[idx], [field]: value }; return c })
  }

  const eliminarPago = (idx) => setPagos(prev => prev.filter((_, i) => i !== idx))

  const handleAbrirPorItem = async () => {
    setLoadingPorItem(true)
    try {
      const data = await getPagosParciales(pedido.id)
      setDatosPorItem(data)
      setItemsSeleccionados({})
      setMetodoPorItem('efectivo')
      setErrorPorItem('')
      setMostrarModalPorItem(true)
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
      const result = await registrarPagoParcial(pedido.id, items)
      if (result.pedido_cerrado) {
        navigate(esSalon ? '/mesas' : '/pedidos')
      } else {
        const data = await getPagosParciales(pedido.id)
        setDatosPorItem(data)
        setItemsSeleccionados({})
      }
    } catch (e) {
      setErrorPorItem(e.response?.data?.detail || 'Error al registrar pago')
    } finally {
      setLoadingPorItem(false)
    }
  }

  const handleImprimirComanda = async () => {
    setImprimiendo(true)
    try {
      await imprimirComanda(pedido.id)
      // Recargar pedido para sincronizar ultimo_detalle_impreso
      const { data } = await api.get(`/pedidos/${pedido.id}`)
      setPedido(data)
    } catch (e) { console.error(e) }
    finally { setImprimiendo(false) }
  }

  const handleImprimirNuevos = async () => {
    setImprimiendo(true)
    try {
      await imprimirNuevosProductos(pedido.id)
      const { data } = await api.get(`/pedidos/${pedido.id}`)
      setPedido(data)
    } catch (e) { console.error(e) }
    finally { setImprimiendo(false) }
  }

  const handleCancelar = async () => {
    if (!window.confirm('¿Cancelar el pedido?')) return
    await eliminarPedido(pedido.id)
    navigate(esSalon ? '/mesas' : '/pedidos')
  }

  const totalTemp = itemsTemp.reduce((acc, i) => acc + Number(i.precio) * i.cantidad, 0)
  const est       = pedido ? ESTADOS[pedido.estado_id] : null

  const tituloPanel = pedidoId
    ? pedido ? `${pedido.tipo_pedido}${pedido.pager ? ` · Pager ${pedido.pager}` : ''}` : tipoPedido
    : esSalon ? `Mesa ${mesaId}`
    : tipoPedido === 'Takeaway' ? `Takeaway${pagerParam ? ` · Pager ${pagerParam}` : ''}` : 'Delivery'

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: "'DM Sans', sans-serif", overflow: 'hidden' }}>

      {/* ═══ MODAL COBRO NORMAL ═══ */}
      {mostrarModalCobro && pedido && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, fontFamily: "'DM Sans', sans-serif" }}>
          <div style={{ background: '#fff', borderRadius: 18, padding: '28px', width: 400, maxWidth: '90vw' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1A0A06', marginBottom: 4 }}>Cobrar pedido</div>
            <div style={{ fontSize: 13, color: '#A0786A', marginBottom: 20 }}>
              Total: <strong style={{ color: '#1A0A06' }}>{fmtPeso(pedido.total)}</strong>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              {pagos.map((p, i) => {
                const totalCubierto = pagos.reduce((acc, x, xi) => xi !== i ? acc + (parseFloat(x.monto) || 0) : acc, 0)
                const restante = Math.max(0, parseFloat(pedido.total) - totalCubierto)
                return (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 6, flex: 1 }}>
                      {['efectivo', 'tarjeta', 'qr'].map(m => (
                        <button key={m} onClick={() => actualizarPago(i, 'metodo', m)}
                          style={{ flex: 1, padding: '8px 4px', borderRadius: 8, cursor: 'pointer', border: `1px solid ${p.metodo === m ? WINE : '#EDE0DB'}`, background: p.metodo === m ? WINE_LIGHT : '#fff', color: p.metodo === m ? WINE : '#5C3A2E', fontSize: 11, fontWeight: p.metodo === m ? 600 : 400 }}>
                          {m === 'efectivo' ? '💵 Efectivo' : m === 'tarjeta' ? '💳 Tarjeta' : '📱 QR'}
                        </button>
                      ))}
                    </div>
                    <input type="number" value={p.monto} onChange={e => actualizarPago(i, 'monto', e.target.value)}
                      onFocus={() => { if (!p.monto && restante > 0) actualizarPago(i, 'monto', restante.toFixed(0)) }}
                      placeholder="Monto"
                      style={{ width: 90, padding: '8px 10px', border: '1px solid #EDE0DB', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'inherit', color: '#1A0A06' }} />
                    {pagos.length > 1 && (
                      <button onClick={() => eliminarPago(i)} style={{ background: '#FEF2F2', color: '#EF4444', border: 'none', borderRadius: 7, padding: '7px 9px', fontSize: 12, cursor: 'pointer' }}>✕</button>
                    )}
                  </div>
                )
              })}
            </div>
            {pagos.length < 3 && (
              <button onClick={agregarMetodoPago} style={{ width: '100%', background: 'none', border: '1px dashed #EDE0DB', borderRadius: 9, padding: '8px', fontSize: 12, color: '#A0786A', cursor: 'pointer', marginBottom: 16 }}>
                + Agregar otro método de pago
              </button>
            )}
            {(() => {
              const totalPagado = pagos.reduce((acc, p) => acc + (parseFloat(p.monto) || 0), 0)
              const diferencia  = totalPagado - parseFloat(pedido.total)
              return (
                <div style={{ background: '#F8F5F4', borderRadius: 10, padding: '12px 14px', marginBottom: 16 }}>
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
              )
            })()}
            {errorCobro && (
              <div style={{ fontSize: 12, color: '#EF4444', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '8px 12px', marginBottom: 12 }}>
                {errorCobro}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { setMostrarModalCobro(false); setPagos([{ metodo: 'efectivo', monto: '' }]); setErrorCobro('') }}
                style={{ flex: 1, background: 'none', color: '#5C3A2E', border: '1px solid #EDE0DB', borderRadius: 10, padding: '11px', fontSize: 13, cursor: 'pointer' }}>
                Cancelar
              </button>
              <button onClick={handleCobrar} disabled={imprimiendo}
                style={{ flex: 2, background: WINE, color: '#fff', border: 'none', borderRadius: 10, padding: '11px', fontSize: 13, fontWeight: 600, cursor: imprimiendo ? 'default' : 'pointer', opacity: imprimiendo ? 0.7 : 1 }}>
                {imprimiendo ? 'Procesando...' : '✓ Confirmar cobro'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL PAGO POR ÍTEM ═══ */}
      {mostrarModalPorItem && datosPorItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, fontFamily: "'DM Sans', sans-serif" }}>
          <div style={{ background: '#fff', borderRadius: 18, padding: '28px', width: 460, maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1A0A06', marginBottom: 4 }}>Pago por ítem</div>
            <div style={{ fontSize: 13, color: '#A0786A', marginBottom: 20 }}>Seleccioná los items que va a pagar esta persona</div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <div style={{ flex: 1, background: '#F8F5F4', borderRadius: 10, padding: '10px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#A0786A', marginBottom: 2 }}>Total pedido</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#1A0A06' }}>{fmtPeso(datosPorItem.total_pedido)}</div>
              </div>
              <div style={{ flex: 1, background: '#DCFCE7', borderRadius: 10, padding: '10px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#A0786A', marginBottom: 2 }}>Ya pagado</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#166534' }}>{fmtPeso(datosPorItem.total_pagado)}</div>
              </div>
              <div style={{ flex: 1, background: '#FEF2EE', borderRadius: 10, padding: '10px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#A0786A', marginBottom: 2 }}>Pendiente</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: WINE }}>{fmtPeso(datosPorItem.total_pendiente)}</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {datosPorItem.detalles.map(d => {
                const seleccionado = !!itemsSeleccionados[d.detalle_id]
                const pendiente    = d.cantidad_pendiente
                if (pendiente === 0) return (
                  <div key={d.detalle_id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#F3F4F6', borderRadius: 10, opacity: 0.5 }}>
                    <span style={{ fontSize: 16 }}>✓</span>
                    <div style={{ flex: 1, fontSize: 13, color: '#6B7280' }}>{d.nombre}</div>
                    <div style={{ fontSize: 12, color: '#6B7280' }}>Pagado</div>
                  </div>
                )
                return (
                  <div key={d.detalle_id} onClick={() => toggleItem(d.detalle_id, pendiente)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 10, cursor: 'pointer', border: `2px solid ${seleccionado ? WINE : '#EDE0DB'}`, background: seleccionado ? WINE_LIGHT : '#fff', transition: 'all 0.15s' }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, border: `2px solid ${seleccionado ? WINE : '#EDE0DB'}`, background: seleccionado ? WINE : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {seleccionado && <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>✓</span>}
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
                            style={{ width: 20, height: 20, borderRadius: 5, background: '#F5EDE8', border: 'none', fontSize: 12, cursor: 'pointer', color: WINE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                          <span style={{ fontSize: 12, fontWeight: 700, color: WINE, minWidth: 14, textAlign: 'center' }}>{itemsSeleccionados[d.detalle_id] || pendiente}</span>
                          <button onClick={e => { e.stopPropagation(); setItemsSeleccionados(prev => ({ ...prev, [d.detalle_id]: Math.min(pendiente, (prev[d.detalle_id] || 1) + 1) })) }}
                            style={{ width: 20, height: 20, borderRadius: 5, background: WINE_LIGHT, border: 'none', fontSize: 12, cursor: 'pointer', color: WINE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#A0786A', marginBottom: 8 }}>Método de pago</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {['efectivo', 'tarjeta', 'qr'].map(m => (
                  <button key={m} onClick={() => setMetodoPorItem(m)}
                    style={{ flex: 1, padding: '9px', borderRadius: 9, cursor: 'pointer', border: `1px solid ${metodoPorItem === m ? WINE : '#EDE0DB'}`, background: metodoPorItem === m ? WINE_LIGHT : '#fff', color: metodoPorItem === m ? WINE : '#5C3A2E', fontSize: 12, fontWeight: metodoPorItem === m ? 600 : 400 }}>
                    {m === 'efectivo' ? '💵 Efectivo' : m === 'tarjeta' ? '💳 Tarjeta' : '📱 QR'}
                  </button>
                ))}
              </div>
            </div>
            {Object.keys(itemsSeleccionados).length > 0 && (
              <div style={{ background: '#F8F5F4', borderRadius: 10, padding: '12px 14px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: '#A0786A' }}>A cobrar ahora</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#1A0A06' }}>
                  {fmtPeso(Object.entries(itemsSeleccionados).reduce((acc, [detalleId, cant]) => {
                    const d = datosPorItem.detalles.find(x => x.detalle_id === parseInt(detalleId))
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
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { setMostrarModalPorItem(false); setDatosPorItem(null); setItemsSeleccionados({}) }}
                style={{ flex: 1, background: 'none', color: '#5C3A2E', border: '1px solid #EDE0DB', borderRadius: 10, padding: '11px', fontSize: 13, cursor: 'pointer' }}>
                Cerrar
              </button>
              <button onClick={handleCobrarPorItem} disabled={loadingPorItem || Object.keys(itemsSeleccionados).length === 0}
                style={{ flex: 2, background: Object.keys(itemsSeleccionados).length > 0 ? WINE : '#E5D5D0', color: '#fff', border: 'none', borderRadius: 10, padding: '11px', fontSize: 13, fontWeight: 600, cursor: Object.keys(itemsSeleccionados).length > 0 ? 'pointer' : 'default' }}>
                {loadingPorItem ? 'Procesando...' : '✓ Cobrar seleccionados'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ PANEL IZQUIERDO — Carta ═══ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#F8F5F4', overflow: 'hidden' }}>
        <div style={{ background: '#fff', borderBottom: '1px solid #EDE0DB', padding: '14px 20px 0' }}>
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: '#C09080' }}>🔍</span>
            <input type="text" placeholder="Buscar producto..." value={buscador} onChange={e => setBuscador(e.target.value)}
              style={{ width: '100%', padding: '8px 12px 8px 32px', border: '1px solid #EDE0DB', borderRadius: 10, fontSize: 13, outline: 'none', background: '#F8F5F4', color: '#1A0A06', fontFamily: 'inherit' }} />
          </div>
          <div style={{ display: 'flex', gap: 2, overflowX: 'auto' }}>
            {categorias.map(cat => (
              <button key={cat.id} onClick={() => { setCatRaiz(cat.id); setBuscador('') }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '7px 14px', fontSize: 13, whiteSpace: 'nowrap', fontWeight: catRaiz === cat.id ? 600 : 400, color: catRaiz === cat.id ? WINE : '#A0786A', borderBottom: catRaiz === cat.id ? `2px solid ${WINE}` : '2px solid transparent', marginBottom: -1, transition: 'all 0.15s' }}>
                {cat.nombre}
              </button>
            ))}
          </div>
        </div>

        {subcategorias.length > 0 && !buscador && (
          <div style={{ display: 'flex', gap: 8, padding: '10px 20px', overflowX: 'auto', background: '#fff', borderBottom: '1px solid #EDE0DB' }}>
            {subcategorias.map(sub => (
              <button key={sub.id} onClick={() => setCatActiva(sub.id)}
                style={{ background: catActiva === sub.id ? WINE_LIGHT : '#F8F5F4', color: catActiva === sub.id ? WINE : '#5C3A2E', border: `1px solid ${catActiva === sub.id ? '#FCA5A5' : '#EDE0DB'}`, borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: catActiva === sub.id ? 600 : 400, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {sub.nombre}
              </button>
            ))}
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 20px' }}>
          {productosFiltrados.length === 0
            ? <div style={{ textAlign: 'center', color: '#C09080', fontSize: 13, padding: '48px 0' }}>No hay productos en esta categoría</div>
            : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: 12 }}>
                {productosFiltrados.map(prod => {
                  const cant = cantidadEnPedido(prod.id)
                  return (
                    <div key={prod.id} style={{ background: '#fff', border: `2px solid ${cant > 0 ? WINE : '#EDE0DB'}`, borderRadius: 14, overflow: 'hidden', boxShadow: cant > 0 ? '0 4px 12px rgba(124,45,18,0.1)' : 'none' }}>
                      <div style={{ height: 90, background: prod.imagen_url ? 'transparent' : (cant > 0 ? WINE_LIGHT : '#F8F5F4'), display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {prod.imagen_url ? <img src={prod.imagen_url} alt={prod.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 32 }}>🍕</span>}
                      </div>
                      <div style={{ padding: '9px 11px 11px' }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#1A0A06', marginBottom: 1, lineHeight: 1.3 }}>{prod.nombre}</div>
                        {prod.descripcion && <div style={{ fontSize: 10, color: '#A0786A', marginBottom: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prod.descripcion}</div>}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: WINE }}>{fmtPeso(prod.precio)}</span>
                          {cant === 0
                            ? <button onClick={() => handleAgregar(prod)} style={{ width: 26, height: 26, borderRadius: 8, background: WINE, color: '#fff', border: 'none', fontSize: 17, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                            : (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                <button onClick={() => handleRestar(prod.id)} style={{ width: 22, height: 22, borderRadius: 6, background: '#F5EDE8', border: 'none', fontSize: 13, cursor: 'pointer', color: WINE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                                <span style={{ fontSize: 12, fontWeight: 700, color: WINE, minWidth: 12, textAlign: 'center' }}>{cant}</span>
                                <button onClick={() => handleAgregar(prod)} style={{ width: 22, height: 22, borderRadius: 6, background: WINE_LIGHT, border: 'none', fontSize: 13, cursor: 'pointer', color: WINE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                              </div>
                            )
                          }
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          }
        </div>
      </div>

      {/* ═══ PANEL DERECHO — Detalle pedido ═══ */}
      <div style={{ width: 340, minWidth: 300, flexShrink: 0, display: 'flex', flexDirection: 'column', borderLeft: '1px solid #EDE0DB', background: '#fff' }}>
        <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #EDE0DB' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>{TIPO_ICONS[tipoPedido] || '🥡'}</span>
                <span style={{ fontSize: 17, fontWeight: 700, color: '#1A0A06', letterSpacing: '-0.3px' }}>{tituloPanel}</span>
              </div>
              {pedido && (
                <div style={{ fontSize: 11, color: '#A0786A', marginTop: 3 }}>
                  Pedido #{pedido.nro_pedido}{mozo && ` · ${mozo.nombre} ${mozo.apellido}`}
                </div>
              )}
            </div>
            {est && (
              <div style={{ fontSize: 10, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: est.bg, color: est.color, flexShrink: 0 }}>
                {est.label}
              </div>
            )}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {pedido ? (
            detalles.length === 0
              ? <div style={{ textAlign: 'center', color: '#C09080', fontSize: 13, padding: '32px 0' }}>Sin productos aún</div>
              : detalles.map(d => (
                <div key={d.id} style={{ padding: '10px 20px', borderBottom: '1px solid #F5EDE8' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0, background: '#FEF2EE', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                      {d.imagen_url ? <img src={d.imagen_url} alt={d.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🍕'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#1A0A06', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.nombre || `Producto ${d.producto_id}`}</div>
                      <div style={{ fontSize: 11, color: '#A0786A' }}>{fmtPeso(d.precio_unitario)} c/u</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button onClick={() => handleRestar(d.producto_id)} style={{ width: 24, height: 24, borderRadius: 7, background: '#F5EDE8', border: 'none', fontSize: 14, cursor: 'pointer', color: WINE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#1A0A06', minWidth: 14, textAlign: 'center' }}>{d.cantidad}</span>
                      <button onClick={() => handleAgregar({ id: d.producto_id, nombre: d.nombre, precio: d.precio_unitario })} style={{ width: 24, height: 24, borderRadius: 7, background: WINE_LIGHT, border: 'none', fontSize: 14, cursor: 'pointer', color: WINE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#1A0A06', minWidth: 52, textAlign: 'right' }}>{fmtPeso(d.subtotal)}</div>
                  </div>
                  {notaActiva === d.id ? (
                    <input autoFocus value={notaInput} onChange={e => setNotaInput(e.target.value)}
                      onBlur={() => handleGuardarNota(d.id)}
                      onKeyDown={e => { if (e.key === 'Enter') handleGuardarNota(d.id); if (e.key === 'Escape') setNotaActiva(null) }}
                      placeholder="Ej: poca salsa, sin cebolla..."
                      style={{ marginTop: 5, width: '100%', fontSize: 11, color: '#5C3A2E', background: '#FEF9F7', border: '1px solid #EDE0DB', borderRadius: 6, padding: '3px 8px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                  ) : (
                    <div onClick={() => handleAbrirNota(d.id, d.nota)} style={{ marginTop: 4, fontSize: 10, color: d.nota ? '#7C4A3A' : '#C09080', cursor: 'pointer', paddingLeft: 46 }}>
                      {d.nota ? `📝 ${d.nota}` : '+ agregar nota'}
                    </div>
                  )}
                </div>
              ))
          ) : (
            itemsTemp.length === 0
              ? <div style={{ textAlign: 'center', color: '#C09080', fontSize: 13, padding: '32px 20px' }}>Seleccioná productos de la carta →</div>
              : itemsTemp.map((item, i) => (
                <div key={i} style={{ padding: '10px 20px', borderBottom: '1px solid #F5EDE8' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0, background: '#FEF2EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🍕</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#1A0A06' }}>{item.nombre}</div>
                      <div style={{ fontSize: 11, color: '#A0786A' }}>{fmtPeso(item.precio)} c/u</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button onClick={() => handleRestar(item.producto_id)} style={{ width: 24, height: 24, borderRadius: 7, background: '#F5EDE8', border: 'none', fontSize: 14, cursor: 'pointer', color: WINE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#1A0A06', minWidth: 14, textAlign: 'center' }}>{item.cantidad}</span>
                      <button onClick={() => handleAgregar({ id: item.producto_id, nombre: item.nombre, precio: item.precio })} style={{ width: 24, height: 24, borderRadius: 7, background: WINE_LIGHT, border: 'none', fontSize: 14, cursor: 'pointer', color: WINE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#1A0A06', minWidth: 52, textAlign: 'right' }}>{fmtPeso(Number(item.precio) * item.cantidad)}</div>
                  </div>
                  {notaActiva === `temp_${i}` ? (
                    <input autoFocus value={notaInput} onChange={e => setNotaInput(e.target.value)}
                      onBlur={() => handleGuardarNota(`temp_${i}`)}
                      onKeyDown={e => { if (e.key === 'Enter') handleGuardarNota(`temp_${i}`); if (e.key === 'Escape') setNotaActiva(null) }}
                      placeholder="Ej: poca salsa, sin cebolla..."
                      style={{ marginTop: 5, width: '100%', fontSize: 11, color: '#5C3A2E', background: '#FEF9F7', border: '1px solid #EDE0DB', borderRadius: 6, padding: '3px 8px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                  ) : (
                    <div onClick={() => handleAbrirNota(`temp_${i}`, item.nota)} style={{ marginTop: 4, fontSize: 10, color: item.nota ? '#7C4A3A' : '#C09080', cursor: 'pointer', paddingLeft: 46 }}>
                      {item.nota ? `📝 ${item.nota}` : '+ agregar nota'}
                    </div>
                  )}
                </div>
              ))
          )}
        </div>

        <div style={{ borderTop: '1px solid #EDE0DB', padding: '14px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: '#A0786A', fontWeight: 500 }}>Total</span>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#1A0A06', letterSpacing: '-0.5px' }}>
              {pedido ? fmtPeso(pedido.total) : fmtPeso(totalTemp)}
            </span>
          </div>

          {pedido ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {pedido.estado_id === 2 && (
                <button onClick={handleAvanzarEstado} style={{ background: '#16A34A', color: '#fff', border: 'none', borderRadius: 10, padding: '11px', fontSize: 13, fontWeight: 600, cursor: 'pointer', width: '100%' }}>
                  Marcar como listo →
                </button>
              )}
              {(pedido.estado_id === 3 || ((pedido.tipo_pedido === 'Takeaway' || pedido.tipo_pedido === 'Delivery') && pedido.estado_id === 2)) && (
                <button onClick={() => setMostrarModalCobro(true)} disabled={imprimiendo}
                  style={{ background: WINE, color: '#fff', border: 'none', borderRadius: 10, padding: '11px', fontSize: 13, fontWeight: 600, cursor: 'pointer', width: '100%' }}>
                  💳 Cobrar
                </button>
              )}
              {(pedido.estado_id === 2 || pedido.estado_id === 3) && detalles.length > 0 && (
                <button onClick={handleAbrirPorItem} disabled={loadingPorItem}
                  style={{ background: '#fff', color: WINE, border: `1px solid ${WINE}`, borderRadius: 10, padding: '9px', fontSize: 13, fontWeight: 600, cursor: 'pointer', width: '100%' }}>
                  👥 Pago por ítem
                </button>
              )}
              {pedido && detalles.some(d => d.id > (pedido.ultimo_detalle_impreso || 0)) && (
                <button onClick={handleImprimirNuevos} disabled={imprimiendo}
                  style={{ background: '#FEF9C3', color: '#854D0E', border: '1px solid #FDE68A', borderRadius: 10, padding: '9px', fontSize: 13, fontWeight: 600, cursor: 'pointer', width: '100%', opacity: imprimiendo ? 0.7 : 1 }}>
                  🖨 Imprimir nuevos productos
                </button>
              )}
              <button onClick={handleImprimirComanda} disabled={imprimiendo}
                style={{ background: '#fff', color: '#5C3A2E', border: '1px solid #EDE0DB', borderRadius: 10, padding: '9px', fontSize: 13, fontWeight: 500, cursor: 'pointer', width: '100%', opacity: imprimiendo ? 0.7 : 1 }}>
                🖨 Reimprimir comanda completa
              </button>
              <button onClick={handleCancelar}
                style={{ background: 'none', color: '#EF4444', border: '1px solid #FECACA', borderRadius: 10, padding: '9px', fontSize: 13, fontWeight: 500, cursor: 'pointer', width: '100%' }}>
                Cancelar pedido
              </button>
            </div>
          ) : (
            <button onClick={handleCrearPedido} disabled={itemsTemp.length === 0}
              style={{ background: itemsTemp.length > 0 ? WINE : '#E5D5D0', color: '#fff', border: 'none', borderRadius: 10, padding: '11px', fontSize: 13, fontWeight: 600, cursor: itemsTemp.length > 0 ? 'pointer' : 'default', width: '100%' }}>
              Crear pedido
            </button>
          )}
        </div>
      </div>
    </div>
  )
}