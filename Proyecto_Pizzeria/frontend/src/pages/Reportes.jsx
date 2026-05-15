import { useState, useEffect, useRef } from 'react'
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { getReporteVentas, getReporteComparar, getReporteProducto, getProductos, getHistorialCajas, getCajasPorFecha } from '../services/api'

const WINE       = '#7C2D12'
const WINE_LIGHT = '#FEF2EE'
const COLORS     = ['#7C2D12', '#B45309', '#15803D', '#1D4ED8', '#7C3AED', '#BE185D', '#0E7490', '#92400E']

function fmtPeso(val) {
  return '$' + Number(val).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function hoy()      { return new Date().toISOString().split('T')[0] }
function hace(dias) { const d = new Date(); d.setDate(d.getDate() - dias); return d.toISOString().split('T')[0] }

const PERIODOS = [
  { id: 'hoy',    label: 'Hoy',    desde: () => hoy(),     hasta: () => hoy()     },
  { id: 'semana', label: 'Semana', desde: () => hace(6),   hasta: () => hoy()     },
  { id: 'mes',    label: 'Mes',    desde: () => hace(29),  hasta: () => hoy()     },
  { id: 'anio',   label: 'Año',    desde: () => hace(364), hasta: () => hoy()     },
  { id: 'custom', label: 'Personalizado', desde: null, hasta: null },
]

const METODO_LABELS = { efectivo: '💵 Efectivo', tarjeta: '💳 Tarjeta', qr: '📱 QR', mixto: '🔀 Mixto' }

export default function Reportes() {
  const reporteRef = useRef(null)

  const [periodo,      setPeriodo]      = useState('semana')
  const [desdeCustom,  setDesdeCustom]  = useState(hace(6))
  const [hastaCustom,  setHastaCustom]  = useState(hoy())
  const [comparar,     setComparar]     = useState(false)
  const [desde2,       setDesde2]       = useState(hace(13))
  const [hasta2,       setHasta2]       = useState(hace(7))
  const [cajaFiltro,   setCajaFiltro]   = useState('')
  const [cajas,        setCajas]        = useState([])
  const [reporte,      setReporte]      = useState(null)
  const [reporte2,     setReporte2]     = useState(null)
  const [loading,      setLoading]      = useState(false)
  const [productos,    setProductos]    = useState([])
  const [prodSel,      setProdSel]      = useState('')
  const [reporteProd,  setReporteProd]  = useState(null)
  const [loadingProd,  setLoadingProd]  = useState(false)
  const [tab,          setTab]          = useState('horario')
  const [cajasDelDia,  setCajasDelDia]  = useState([])

  useEffect(() => {
    getProductos().then(data => setProductos(data.filter(p => p.activo)))
    getHistorialCajas().then(data => setCajas(data))
  }, [])

  // Detectar si es día único y cargar turnos
  useEffect(() => {
    const esDiaUnico = !cajaFiltro && (periodo === 'hoy' || (periodo === 'custom' && desdeCustom === hastaCustom))
    if (!esDiaUnico) { setCajasDelDia([]); return }
    const fecha = periodo === 'hoy' ? hoy() : desdeCustom
    getCajasPorFecha(fecha).then(data => setCajasDelDia(data)).catch(() => setCajasDelDia([]))
  }, [periodo, desdeCustom, hastaCustom, cajaFiltro])

  const getDesdeHasta = () => {
    if (cajaFiltro) {
      // Si hay caja seleccionada, usar rango amplio
      return { desde: hace(365), hasta: hoy() }
    }
    if (periodo === 'custom') return { desde: desdeCustom, hasta: hastaCustom }
    const p = PERIODOS.find(p => p.id === periodo)
    if (!p || !p.desde) return { desde: hace(6), hasta: hoy() }
    return { desde: p.desde(), hasta: p.hasta() }
  }

  const cargar = async () => {
    setLoading(true)
    try {
      const { desde, hasta } = getDesdeHasta()
      if (comparar) {
        const data = await getReporteComparar(desde, hasta, desde2, hasta2)
        setReporte(data.periodo1)
        setReporte2(data.periodo2)
      } else {
        const data = await getReporteVentas(desde, hasta, cajaFiltro || null)
        setReporte(data)
        setReporte2(null)
      }
    } finally {
      setLoading(false)
    }
  }

  const cargarProducto = async () => {
    if (!prodSel) return
    setLoadingProd(true)
    const { desde, hasta } = getDesdeHasta()
    try {
      const data = await getReporteProducto(prodSel, desde, hasta)
      setReporteProd(data)
    } finally {
      setLoadingProd(false)
    }
  }

  const inputStyle = {
    padding: '7px 10px', border: '1px solid #EDE0DB', borderRadius: 8,
    fontSize: 12, outline: 'none', fontFamily: 'inherit', color: '#1A0A06', background: '#fff',
  }

  const TABS = [
    { id: 'horario',    label: '📈 Por horario'   },
    { id: 'productos',  label: '🏆 Más vendidos'  },
    { id: 'categorias', label: '🥧 Por categoría' },
    { id: 'pedidos',    label: '📋 Pedidos'       },
    { id: 'producto',   label: '🔍 Producto'      },
  ]

  return (
    <div style={{ padding: '28px 32px', fontFamily: "'DM Sans', sans-serif" }} ref={reporteRef}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#1A0A06', letterSpacing: '-0.4px' }}>Reportes</div>
          <div style={{ fontSize: 13, color: '#A0786A', marginTop: 2 }}>Análisis de ventas y productos</div>
        </div>
        <button onClick={() => window.print()}
          style={{ background: '#fff', color: '#5C3A2E', border: '1px solid #EDE0DB', borderRadius: 10, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          📄 Exportar PDF
        </button>
      </div>

      {/* Controles */}
      <div style={{ background: '#fff', border: '1px solid #EDE0DB', borderRadius: 14, padding: '18px 20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>

          {/* Selector período */}
          <div style={{ display: 'flex', gap: 6 }}>
            {PERIODOS.map(p => (
              <button key={p.id} onClick={() => { setPeriodo(p.id); setCajaFiltro('') }}
                style={{ padding: '6px 14px', borderRadius: 20, cursor: 'pointer', fontSize: 12, fontWeight: 600, border: `1px solid ${periodo === p.id && !cajaFiltro ? WINE : '#EDE0DB'}`, background: periodo === p.id && !cajaFiltro ? WINE : '#fff', color: periodo === p.id && !cajaFiltro ? '#fff' : '#5C3A2E' }}>
                {p.label}
              </button>
            ))}
          </div>

          {/* Selector caja */}
          <select value={cajaFiltro} onChange={e => { setCajaFiltro(e.target.value); setPeriodo('') }}
            style={{ ...inputStyle, minWidth: 200 }}>
            <option value="">Todas las cajas</option>
            {cajas.map(c => (
              <option key={c.id} value={c.id}>
                {c.activo ? '🟢 ' : ''}Caja #{c.id} — {new Date(c.fecha_apertura).toLocaleDateString('es-AR')} {new Date(c.fecha_apertura).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
              </option>
            ))}
          </select>

          {/* Fechas custom */}
          {periodo === 'custom' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="date" value={desdeCustom} onChange={e => setDesdeCustom(e.target.value)} style={inputStyle} />
              <span style={{ fontSize: 12, color: '#A0786A' }}>→</span>
              <input type="date" value={hastaCustom} onChange={e => setHastaCustom(e.target.value)} style={inputStyle} />
            </div>
          )}

          {/* Toggle comparar */}
          {!cajaFiltro && (
            <button onClick={() => setComparar(v => !v)}
              style={{ padding: '6px 14px', borderRadius: 20, cursor: 'pointer', fontSize: 12, fontWeight: 600, border: `1px solid ${comparar ? '#1D4ED8' : '#EDE0DB'}`, background: comparar ? '#EFF6FF' : '#fff', color: comparar ? '#1D4ED8' : '#5C3A2E' }}>
              ⇄ Comparar períodos
            </button>
          )}

          <button onClick={cargar} disabled={loading}
            style={{ background: WINE, color: '#fff', border: 'none', borderRadius: 10, padding: '8px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            {loading ? 'Cargando...' : 'Ver reporte'}
          </button>
        </div>

        {/* Período 2 */}
        {comparar && !cajaFiltro && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, paddingTop: 12, borderTop: '1px solid #EDE0DB' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#1D4ED8' }}>Período 2:</span>
            <input type="date" value={desde2} onChange={e => setDesde2(e.target.value)} style={inputStyle} />
            <span style={{ fontSize: 12, color: '#A0786A' }}>→</span>
            <input type="date" value={hasta2} onChange={e => setHasta2(e.target.value)} style={inputStyle} />
          </div>
        )}

        {/* Turnos del día */}
        {cajasDelDia.length > 0 && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #EDE0DB' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#A0786A', marginBottom: 8 }}>Turnos del día</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                onClick={() => { setCajaFiltro(''); }}
                style={{ padding: '5px 14px', borderRadius: 20, cursor: 'pointer', fontSize: 12, fontWeight: 600, border: `1px solid ${!cajaFiltro ? WINE : '#EDE0DB'}`, background: !cajaFiltro ? WINE : '#fff', color: !cajaFiltro ? '#fff' : '#5C3A2E' }}
              >
                Todos
              </button>
              {cajasDelDia.map(c => {
                const hora = c.fecha_apertura ? new Date(c.fecha_apertura).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) : ''
                const activo = String(cajaFiltro) === String(c.id)
                return (
                  <button
                    key={c.id}
                    onClick={() => setCajaFiltro(String(c.id))}
                    style={{ padding: '5px 14px', borderRadius: 20, cursor: 'pointer', fontSize: 12, fontWeight: 600, border: `1px solid ${activo ? WINE : '#EDE0DB'}`, background: activo ? WINE : '#fff', color: activo ? '#fff' : '#5C3A2E' }}
                  >
                    {c.activo ? '🟢 ' : ''}Turno {hora}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {!reporte ? (
        <div style={{ textAlign: 'center', color: '#C09080', fontSize: 13, padding: '64px 0' }}>
          Seleccioná un período o caja y hacé click en "Ver reporte"
        </div>
      ) : (
        <>
          {/* Cards resumen */}
          <div style={{ display: 'grid', gridTemplateColumns: comparar ? '1fr 1fr 1fr' : 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
            {comparar ? (
              [
                { label: 'Total ventas',    v1: fmtPeso(reporte.total_ventas),    v2: fmtPeso(reporte2?.total_ventas || 0) },
                { label: 'Total pedidos',   v1: reporte.total_pedidos,            v2: reporte2?.total_pedidos || 0 },
                { label: 'Ticket promedio', v1: fmtPeso(reporte.ticket_promedio), v2: fmtPeso(reporte2?.ticket_promedio || 0) },
              ].map((item, i) => (
                <div key={i} style={{ background: '#fff', border: '1px solid #EDE0DB', borderRadius: 14, padding: '18px 20px' }}>
                  <div style={{ fontSize: 12, color: '#A0786A', fontWeight: 500, marginBottom: 12 }}>{item.label}</div>
                  <div style={{ display: 'flex', gap: 20 }}>
                    <div>
                      <div style={{ fontSize: 11, color: WINE, fontWeight: 600, marginBottom: 4 }}>Período 1</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: '#1A0A06' }}>{item.v1}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: '#1D4ED8', fontWeight: 600, marginBottom: 4 }}>Período 2</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: '#1A0A06' }}>{item.v2}</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <>
                <div style={{ background: WINE, borderRadius: 14, padding: '20px 22px', color: '#fff' }}>
                  <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 8 }}>Total ventas</div>
                  <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-1px' }}>{fmtPeso(reporte.total_ventas)}</div>
                </div>
                <div style={{ background: '#fff', border: '1px solid #EDE0DB', borderRadius: 14, padding: '20px 22px' }}>
                  <div style={{ fontSize: 12, color: '#A0786A', marginBottom: 8 }}>Total pedidos</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#1A0A06' }}>{reporte.total_pedidos}</div>
                </div>
                <div style={{ background: '#fff', border: '1px solid #EDE0DB', borderRadius: 14, padding: '20px 22px' }}>
                  <div style={{ fontSize: 12, color: '#A0786A', marginBottom: 8 }}>Ticket promedio</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#1A0A06' }}>{fmtPeso(reporte.ticket_promedio)}</div>
                </div>
                {/* Desglose por método */}
                <div style={{ background: '#fff', border: '1px solid #EDE0DB', borderRadius: 14, padding: '20px 22px' }}>
                  <div style={{ fontSize: 12, color: '#A0786A', marginBottom: 8 }}>Por método de pago</div>
                  {Object.entries(reporte.por_metodo || {}).map(([metodo, monto]) => (
                    <div key={metodo} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: '#5C3A2E' }}>{METODO_LABELS[metodo] || metodo}</span>
                      <span style={{ fontWeight: 700, color: '#1A0A06' }}>{fmtPeso(monto)}</span>
                    </div>
                  ))}
                  {Object.keys(reporte.por_metodo || {}).length === 0 && (
                    <div style={{ fontSize: 12, color: '#C09080' }}>Sin datos</div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ padding: '7px 16px', borderRadius: 20, cursor: 'pointer', fontSize: 12, fontWeight: 600, border: `1px solid ${tab === t.id ? WINE : '#EDE0DB'}`, background: tab === t.id ? WINE : '#fff', color: tab === t.id ? '#fff' : '#5C3A2E' }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Gráfico horario — HORIZONTAL */}
          {tab === 'horario' && (
            <div style={{ background: '#fff', border: '1px solid #EDE0DB', borderRadius: 14, padding: '20px' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1A0A06', marginBottom: 16 }}>Ventas por horario</div>
              <ResponsiveContainer width="100%" height={reporte.por_hora.length * 40 + 60}>
                <BarChart data={reporte.por_hora} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#F5EDE8" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#A0786A' }} tickFormatter={v => '$' + v.toLocaleString('es-AR')} />
                  <YAxis type="category" dataKey="hora" tick={{ fontSize: 11, fill: '#A0786A' }} width={55} />
                  <Tooltip formatter={v => fmtPeso(v)} />
                  {comparar && reporte2 && <Legend />}
                  <Bar dataKey="ventas" fill={WINE} radius={[0, 4, 4, 0]} name="Período 1" />
                  {comparar && reporte2 && (
                    <Bar data={reporte2.por_hora} dataKey="ventas" fill="#1D4ED8" radius={[0, 4, 4, 0]} name="Período 2" />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Más vendidos */}
          {tab === 'productos' && (
            <div style={{ background: '#fff', border: '1px solid #EDE0DB', borderRadius: 14, padding: '20px' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1A0A06', marginBottom: 16 }}>Productos más vendidos</div>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={reporte.productos_top} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#F5EDE8" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#A0786A' }} />
                  <YAxis type="category" dataKey="nombre" tick={{ fontSize: 11, fill: '#A0786A' }} width={120} />
                  <Tooltip formatter={(v, name) => name === 'total' ? fmtPeso(v) : v} />
                  <Legend />
                  <Bar dataKey="cantidad" fill={WINE} name="Cantidad" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Por categoría */}
          {tab === 'categorias' && (
            <div style={{ background: '#fff', border: '1px solid #EDE0DB', borderRadius: 14, padding: '20px' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1A0A06', marginBottom: 16 }}>Ventas por categoría</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={reporte.por_categoria} dataKey="total" nameKey="categoria" cx="50%" cy="50%" outerRadius={100}
                      label={({ categoria, percent }) => `${categoria} ${(percent * 100).toFixed(0)}%`}>
                      {reporte.por_categoria.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={v => fmtPeso(v)} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
                  {reporte.por_categoria.map((c, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#F8F5F4', borderRadius: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                        <span style={{ fontSize: 13, color: '#1A0A06' }}>{c.categoria}</span>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#1A0A06' }}>{fmtPeso(c.total)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Listado pedidos */}
          {tab === 'pedidos' && (
            <div style={{ background: '#fff', border: '1px solid #EDE0DB', borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #EDE0DB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1A0A06' }}>Listado de pedidos</div>
                <div style={{ fontSize: 13, color: '#A0786A' }}>{reporte.pedidos.length} pedidos</div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#F8F5F4' }}>
                      {['#', 'Fecha', 'Hora', 'Tipo', 'Mesa', 'Total', 'Método'].map(h => (
                        <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#A0786A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reporte.pedidos.map((p, i) => (
                      <tr key={p.id} style={{ borderTop: '1px solid #F5EDE8', background: i % 2 === 0 ? '#fff' : '#FEFCFB' }}>
                        <td style={{ padding: '10px 16px', color: '#A0786A' }}>#{p.nro_pedido}</td>
                        <td style={{ padding: '10px 16px', color: '#1A0A06' }}>{p.fecha}</td>
                        <td style={{ padding: '10px 16px', color: '#1A0A06' }}>{p.hora}</td>
                        <td style={{ padding: '10px 16px', color: '#1A0A06' }}>{p.tipo_pedido}</td>
                        <td style={{ padding: '10px 16px', color: '#1A0A06' }}>{p.mesa_id ? `Mesa ${p.mesa_id}` : '—'}</td>
                        <td style={{ padding: '10px 16px', fontWeight: 700, color: WINE }}>{fmtPeso(p.total)}</td>
                        <td style={{ padding: '10px 16px' }}>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: '#F3F4F6', color: '#374151' }}>
                            {METODO_LABELS[p.metodo_pago] || p.metodo_pago}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {reporte.pedidos.length === 0 && (
                  <div style={{ textAlign: 'center', color: '#C09080', fontSize: 13, padding: '32px 0' }}>Sin pedidos en este período</div>
                )}
              </div>
            </div>
          )}

          {/* Producto específico */}
          {tab === 'producto' && (
            <div style={{ background: '#fff', border: '1px solid #EDE0DB', borderRadius: 14, padding: '20px' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1A0A06', marginBottom: 16 }}>Análisis por producto</div>
              <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                <select value={prodSel} onChange={e => setProdSel(e.target.value)}
                  style={{ flex: 1, padding: '9px 12px', border: '1px solid #EDE0DB', borderRadius: 9, fontSize: 13, outline: 'none', fontFamily: 'inherit', color: '#1A0A06', background: '#fff' }}>
                  <option value="">Seleccionar producto</option>
                  {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
                <button onClick={cargarProducto} disabled={!prodSel || loadingProd}
                  style={{ background: prodSel ? WINE : '#E5D5D0', color: '#fff', border: 'none', borderRadius: 9, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: prodSel ? 'pointer' : 'default' }}>
                  {loadingProd ? 'Cargando...' : 'Ver'}
                </button>
              </div>
              {reporteProd && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
                    <div style={{ background: '#F8F5F4', borderRadius: 10, padding: '14px 16px' }}>
                      <div style={{ fontSize: 11, color: '#A0786A', marginBottom: 4 }}>Unidades vendidas</div>
                      <div style={{ fontSize: 28, fontWeight: 800, color: '#1A0A06' }}>{reporteProd.total_cantidad}</div>
                    </div>
                    <div style={{ background: '#F8F5F4', borderRadius: 10, padding: '14px 16px' }}>
                      <div style={{ fontSize: 11, color: '#A0786A', marginBottom: 4 }}>Total generado</div>
                      <div style={{ fontSize: 28, fontWeight: 800, color: '#1A0A06' }}>{fmtPeso(reporteProd.total_ventas)}</div>
                    </div>
                    <div style={{ background: '#F8F5F4', borderRadius: 10, padding: '14px 16px' }}>
                      <div style={{ fontSize: 11, color: '#A0786A', marginBottom: 4 }}>Días con ventas</div>
                      <div style={{ fontSize: 28, fontWeight: 800, color: '#1A0A06' }}>{reporteProd.por_dia.length}</div>
                    </div>
                  </div>
                  {reporteProd.por_dia.length > 0 && (
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={reporteProd.por_dia}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F5EDE8" />
                        <XAxis dataKey="fecha" tick={{ fontSize: 10, fill: '#A0786A' }} />
                        <YAxis tick={{ fontSize: 11, fill: '#A0786A' }} />
                        <Tooltip />
                        <Bar dataKey="cantidad" fill={WINE} radius={[4, 4, 0, 0]} name="Unidades" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}