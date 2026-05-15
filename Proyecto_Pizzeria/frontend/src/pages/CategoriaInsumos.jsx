import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getInsumo, crearInsumo, agregarCompra } from '../services/api'
import api from '../services/api'

const WINE       = '#7C2D12'
const WINE_LIGHT = '#FEF2EE'

const UNIDADES = ['unidad', 'kg', 'gr', 'litros', 'ml', 'docena']

const inputStyle = {
  width: '100%', padding: '9px 12px',
  border: '1px solid #EDE0DB', borderRadius: 9,
  fontSize: 13, outline: 'none',
  fontFamily: 'inherit', color: '#1A0A06', background: '#fff',
}

const labelStyle = {
  fontSize: 12, fontWeight: 600,
  color: '#A0786A', marginBottom: 5, display: 'block',
}

const TIPO_COLORS = {
  compra:    { bg: '#DCFCE7', color: '#166534', label: '↑ Compra'    },
  venta:     { bg: '#FEE2E2', color: '#991B1B', label: '↓ Venta'     },
  ajuste:    { bg: '#FEF9C3', color: '#854D0E', label: '✎ Ajuste'    },
  reversion: { bg: '#EFF6FF', color: '#1D4ED8', label: '↩ Reversión' },
}

function stockStyle(stock) {
  if (stock <= 0) return { bg: '#FEE2E2', color: '#991B1B', label: 'Sin stock' }
  if (stock <= 3) return { bg: '#FEF9C3', color: '#854D0E', label: `Stock: ${stock}` }
  return                 { bg: '#DCFCE7', color: '#166534', label: `Stock: ${stock}` }
}

export default function CategoriaInsumos() {
  const { categoriaId } = useParams()
  const navigate        = useNavigate()

  const [insumos,           setInsumos]           = useState([])
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [nombre,            setNombre]            = useState('')
  const [precio,            setPrecio]            = useState('')
  const [descripcion,       setDescripcion]       = useState('')
  const [unidadMedida,      setUnidadMedida]      = useState('unidad')

  // Compra por insumo: { [insumoId]: { cantidad, monto } }
  const [compras, setCompras] = useState({})
  // Control de qué insumo tiene el formulario de compra abierto
  const [comprAbierta, setComprAbierta] = useState(null)

  // Historial modal
  const [historialInsumo,  setHistorialInsumo]  = useState(null)
  const [movimientos,      setMovimientos]      = useState([])
  const [loadingHistorial, setLoadingHistorial] = useState(false)

  const cargar = () => getInsumo(categoriaId).then(data => setInsumos(data))
  useEffect(() => { cargar() }, [categoriaId])

  const handleCrear = () => {
    if (!nombre.trim()) return
    crearInsumo({
      nombre,
      precio: parseFloat(precio) || 0,
      descripcion,
      categoria_id:  parseInt(categoriaId),
      stock_actual:  0,
      nro_insumo:    insumos.length + 1,
      unidad_medida: unidadMedida,
    }).then(() => {
      cargar()
      setNombre(''); setPrecio(''); setDescripcion(''); setUnidadMedida('unidad')
      setMostrarFormulario(false)
    })
  }

  const handleCompra = async (insumo) => {
    const c = compras[insumo.id] || {}
    if (!c.cantidad || !c.monto) return
    await agregarCompra(insumo.id, parseFloat(c.cantidad), parseFloat(c.monto))
    cargar()
    setCompras(prev => ({ ...prev, [insumo.id]: { cantidad: '', monto: '' } }))
    setComprAbierta(null)
  }

  const setCompraField = (insumoId, field, value) => {
    setCompras(prev => ({
      ...prev,
      [insumoId]: { ...prev[insumoId], [field]: value }
    }))
  }

  const handleAbrirHistorial = async (insumo) => {
    setHistorialInsumo(insumo)
    setLoadingHistorial(true)
    try {
      const { data } = await api.get(`/insumos/${insumo.id}/movimientos`)
      setMovimientos(data)
    } catch (e) {
      setMovimientos([])
    } finally {
      setLoadingHistorial(false)
    }
  }

  return (
    <div style={{ padding: '28px 32px', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Modal historial */}
      {historialInsumo && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, fontFamily: "'DM Sans', sans-serif" }}>
          <div style={{ background: '#fff', borderRadius: 18, padding: '28px', width: 500, maxWidth: '90vw', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#1A0A06' }}>📋 Historial de movimientos</div>
                <div style={{ fontSize: 13, color: '#A0786A', marginTop: 2 }}>{historialInsumo.nombre}</div>
              </div>
              <button onClick={() => setHistorialInsumo(null)} style={{ background: '#F3F4F6', border: 'none', borderRadius: 8, padding: '6px 10px', fontSize: 13, cursor: 'pointer', color: '#374151' }}>✕</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {loadingHistorial ? (
                <div style={{ textAlign: 'center', color: '#A0786A', fontSize: 13, padding: '32px 0' }}>Cargando...</div>
              ) : movimientos.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#C09080', fontSize: 13, padding: '32px 0' }}>Sin movimientos registrados</div>
              ) : (
                <div>
                  {movimientos.map(m => {
                    const tipo = TIPO_COLORS[m.tipo_movimiento] || { bg: '#F3F4F6', color: '#6B7280', label: m.tipo_movimiento }
                    return (
                      <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #F5EDE8' }}>
                        <div style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: tipo.bg, color: tipo.color, flexShrink: 0, whiteSpace: 'nowrap' }}>
                          {tipo.label}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: m.cantidad > 0 ? '#166534' : '#991B1B' }}>
                            {m.cantidad > 0 ? '+' : ''}{m.cantidad} {historialInsumo.unidad_medida}
                          </div>
                          {m.nota && <div style={{ fontSize: 11, color: '#A0786A', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.nota}</div>}
                        </div>
                        <div style={{ fontSize: 11, color: '#C09080', flexShrink: 0 }}>{m.fecha}</div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#1A0A06', letterSpacing: '-0.4px' }}>Insumos</div>
          <div style={{ fontSize: 13, color: '#A0786A', marginTop: 2 }}>{insumos.length} insumos</div>
        </div>
        <button
          onClick={() => setMostrarFormulario(true)}
          style={{ background: WINE, color: '#fff', border: 'none', borderRadius: 10, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
        >
          + Nuevo insumo
        </button>
      </div>

      {/* Formulario nuevo insumo */}
      {mostrarFormulario && (
        <div style={{ background: '#fff', border: `1px solid ${WINE}`, borderRadius: 14, padding: '20px', marginBottom: 20, maxWidth: 480 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1A0A06', marginBottom: 16 }}>Nuevo insumo</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={labelStyle}>Nombre</label>
              <input autoFocus value={nombre} onChange={e => setNombre(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Precio referencia</label>
              <input type="number" value={precio} onChange={e => setPrecio(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Unidad de medida</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {UNIDADES.map(u => (
                  <button key={u} type="button" onClick={() => setUnidadMedida(u)}
                    style={{ padding: '6px 14px', borderRadius: 20, cursor: 'pointer', border: `1px solid ${unidadMedida === u ? WINE : '#EDE0DB'}`, background: unidadMedida === u ? WINE_LIGHT : '#fff', color: unidadMedida === u ? WINE : '#5C3A2E', fontSize: 12, fontWeight: unidadMedida === u ? 600 : 400 }}>
                    {u}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={labelStyle}>Descripción</label>
              <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button onClick={handleCrear} style={{ flex: 1, background: WINE, color: '#fff', border: 'none', borderRadius: 9, padding: '10px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Confirmar</button>
            <button onClick={() => { setMostrarFormulario(false); setNombre(''); setPrecio(''); setDescripcion(''); setUnidadMedida('unidad') }} style={{ flex: 1, background: 'none', color: '#5C3A2E', border: '1px solid #EDE0DB', borderRadius: 9, padding: '10px', fontSize: 13, cursor: 'pointer' }}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Grid insumos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
        {insumos.map(insumo => {
          const st      = stockStyle(insumo.stock_actual)
          const abierta = comprAbierta === insumo.id
          const c       = compras[insumo.id] || {}

          return (
            <div key={insumo.id} style={{ background: '#fff', border: '1px solid #EDE0DB', borderRadius: 14, padding: '16px 18px' }}>

              {/* Fila superior */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1A0A06' }}>{insumo.nombre}</div>
                  <div style={{ fontSize: 11, color: '#A0786A', marginTop: 2 }}>
                    {insumo.unidad_medida && (
                      <span style={{ background: '#F3F4F6', borderRadius: 6, padding: '1px 7px', marginRight: 4 }}>{insumo.unidad_medida}</span>
                    )}
                    {insumo.descripcion}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: st.bg, color: st.color }}>
                    {st.label}
                  </div>
                  <button
                    onClick={() => navigate(`/insumos/${categoriaId}/${insumo.id}`)}
                    style={{ background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: 7, padding: '5px 9px', fontSize: 12, cursor: 'pointer' }}
                  >✎</button>
                </div>
              </div>

              {/* Botones acción */}
              <div style={{ display: 'flex', gap: 6, marginBottom: abierta ? 10 : 0 }}>
                <button
                  onClick={() => handleAbrirHistorial(insumo)}
                  style={{ flex: 1, background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: 8, padding: '6px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                >
                  📋 Historial
                </button>
                {!abierta && (
                  <button
                    onClick={() => setComprAbierta(insumo.id)}
                    style={{ flex: 1, background: WINE_LIGHT, color: WINE, border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                  >
                    + Registrar compra
                  </button>
                )}
              </div>

              {/* Formulario compra */}
              {abierta && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: '#A0786A', marginBottom: 3 }}>
                        Cantidad ({insumo.unidad_medida || 'unidad'})
                      </div>
                      <input
                        autoFocus
                        type="number"
                        min="0"
                        step="0.01"
                        value={c.cantidad || ''}
                        onChange={e => setCompraField(insumo.id, 'cantidad', e.target.value)}
                        style={{ width: '100%', padding: '7px 10px', border: '1px solid #EDE0DB', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'inherit', color: '#1A0A06' }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: '#A0786A', marginBottom: 3 }}>
                        Precio pagado ($)
                      </div>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={c.monto || ''}
                        onChange={e => setCompraField(insumo.id, 'monto', e.target.value)}
                        style={{ width: '100%', padding: '7px 10px', border: '1px solid #EDE0DB', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'inherit', color: '#1A0A06' }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => handleCompra(insumo)}
                      disabled={!c.cantidad || !c.monto}
                      style={{ flex: 1, background: c.cantidad && c.monto ? WINE : '#E5D5D0', color: '#fff', border: 'none', borderRadius: 8, padding: '8px', fontSize: 12, fontWeight: 600, cursor: c.cantidad && c.monto ? 'pointer' : 'default' }}
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => { setComprAbierta(null); setCompraField(insumo.id, 'cantidad', ''); setCompraField(insumo.id, 'monto', '') }}
                      style={{ flex: 1, background: 'none', color: '#5C3A2E', border: '1px solid #EDE0DB', borderRadius: 8, padding: '8px', fontSize: 12, cursor: 'pointer' }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {!mostrarFormulario && (
          <button
            onClick={() => setMostrarFormulario(true)}
            style={{ background: 'none', border: '2px dashed #EDE0DB', borderRadius: 14, padding: '16px 18px', cursor: 'pointer', color: '#C09080', fontSize: 13, fontWeight: 500 }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = WINE; e.currentTarget.style.color = WINE }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#EDE0DB'; e.currentTarget.style.color = '#C09080' }}
          >
            + Agregar insumo
          </button>
        )}
      </div>
    </div>
  )
}
