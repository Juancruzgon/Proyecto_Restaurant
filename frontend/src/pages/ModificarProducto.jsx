import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  getProductoPorId, modificarProducto, eliminarProducto,
  getReceta, agregarIngrediente, modificarIngrediente,
  eliminarIngrediente, getInsumos,
} from '../services/api'

const WINE = '#7C2D12'
const WINE_LIGHT = '#FEF2EE'

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

export default function ModificarProducto() {
  const navigate    = useNavigate()
  const { productoId, categoriaId } = useParams()

  const [producto,    setProducto]    = useState(null)
  const [nombre,      setNombre]      = useState('')
  const [precio,      setPrecio]      = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [imagenUrl,   setImagenUrl]   = useState('')
  const [descuento,   setDescuento]   = useState('')
  const [tipo,        setTipo]        = useState('sin_receta')
  const [insumoId,    setInsumoId]    = useState('')
  const [agotado,     setAgotado]     = useState(false)
  const isAdmin = localStorage.getItem('rol_id') === '1'

  // Receta
  const [receta,       setReceta]       = useState([])
  const [insumos,      setInsumos]      = useState([])
  const [insumoSel,    setInsumoSel]    = useState('')
  const [cantidadSel,  setCantidadSel]  = useState('')
  const [editandoRec,  setEditandoRec]  = useState(null)
  const [editCantidad, setEditCantidad] = useState('')

  const cargarReceta = () => getReceta(productoId).then(data => setReceta(data))

  useEffect(() => {
    getProductoPorId(productoId).then(data => {
      setProducto(data)
      setNombre(data.nombre)
      setPrecio(data.precio)
      setDescripcion(data.descripcion || '')
      setImagenUrl(data.imagen_url || '')
      setDescuento(data.descuento || '')
      setTipo(data.tipo || 'sin_receta')
      setInsumoId(data.insumo_id || '')
      setAgotado(data.agotado ?? false)
    })
    cargarReceta()
    getInsumos().then(data => setInsumos(data))
  }, [productoId])

  const handleSubmit = (e) => {
    e.preventDefault()
    modificarProducto(productoId, {
      nombre,
      precio: parseFloat(precio),
      descripcion,
      imagen_url: imagenUrl || null,
      descuento: descuento ? parseInt(descuento) : null,
      tipo,
      insumo_id: tipo === 'sin_receta' && insumoId ? parseInt(insumoId) : null,
      agotado,
    }).then(() => navigate(`/productos/${producto.categoria_id}`))
  }

  const handleEliminar = () => {
    if (window.confirm('¿Eliminar este producto?')) {
      eliminarProducto(productoId).then(() => navigate(`/productos/${producto.categoria_id}`))
    }
  }

  const handleAgregarIngrediente = async () => {
    if (!insumoSel || !cantidadSel) return
    await agregarIngrediente({
      producto_id: parseInt(productoId),
      insumo_id:   parseInt(insumoSel),
      cantidad:    parseFloat(cantidadSel),
    })
    setInsumoSel(''); setCantidadSel('')
    cargarReceta()
  }

  const handleGuardarIngrediente = async (id) => {
    await modificarIngrediente(id, { cantidad: parseFloat(editCantidad) })
    setEditandoRec(null)
    cargarReceta()
  }

  const handleEliminarIngrediente = async (id) => {
    if (!window.confirm('¿Eliminar este ingrediente?')) return
    await eliminarIngrediente(id)
    cargarReceta()
  }

  if (!producto) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#A0786A', fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}>
      Cargando...
    </div>
  )

  return (
    <div style={{ padding: '28px 32px', fontFamily: "'DM Sans', sans-serif", maxWidth: 560 }}>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#1A0A06', letterSpacing: '-0.4px' }}>Modificar producto</div>
        <div style={{ fontSize: 13, color: '#A0786A', marginTop: 2 }}>{producto.nombre}</div>
      </div>

      {/* Formulario producto */}
      <div style={{ background: '#fff', border: '1px solid #EDE0DB', borderRadius: 16, padding: '24px', marginBottom: 20 }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          <div>
            <label style={labelStyle}>Nombre</label>
            <input value={nombre} onChange={e => setNombre(e.target.value)} style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Precio</label>
            <input type="number" value={precio} onChange={e => setPrecio(e.target.value)} style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Descripción</label>
            <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>

          <div>
            <label style={labelStyle}>URL de imagen</label>
            <input value={imagenUrl} onChange={e => setImagenUrl(e.target.value)} placeholder="https://..." style={inputStyle} />
            {imagenUrl && (
              <div style={{ marginTop: 8, height: 100, borderRadius: 9, overflow: 'hidden', border: '1px solid #EDE0DB' }}>
                <img src={imagenUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
          </div>

          <div>
            <label style={labelStyle}>Descuento (%)</label>
            <input type="number" min="0" max="100" value={descuento} onChange={e => setDescuento(e.target.value)} placeholder="0" style={inputStyle} />
          </div>

          {/* Estado agotado — solo admin */}
          {isAdmin && (
            <div style={{ padding: '12px 14px', borderRadius: 10, background: agotado ? '#FEF2F2' : '#F8F5F4', border: `1px solid ${agotado ? '#FECACA' : '#EDE0DB'}`, transition: 'all 0.2s' }}>
              <div
                onClick={() => setAgotado(v => !v)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', userSelect: 'none' }}
              >
                <div style={{
                  width: 40, height: 22, borderRadius: 11,
                  background: agotado ? '#EF4444' : '#D1D5DB',
                  position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                }}>
                  <div style={{
                    position: 'absolute', top: 2, left: agotado ? 20 : 2,
                    width: 18, height: 18, borderRadius: '50%', background: '#fff',
                    transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: agotado ? '#EF4444' : '#9CA3AF' }}>
                    {agotado ? 'Producto agotado' : 'Disponible'}
                  </div>
                  <div style={{ fontSize: 11, color: '#A0786A', marginTop: 1 }}>
                    {agotado ? 'Se muestra en la carta pero no se puede agregar al pedido' : 'Se puede agregar al pedido normalmente'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tipo de stock */}
          <div>
            <label style={labelStyle}>Tipo de stock</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { val: 'sin_receta', label: 'Sin receta', desc: 'Descuenta unidades directamente' },
                { val: 'con_receta', label: 'Con receta', desc: 'Descuenta según ingredientes' },
              ].map(op => (
                <button
                  key={op.val}
                  type="button"
                  onClick={() => setTipo(op.val)}
                  style={{
                    flex: 1, padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                    border: `2px solid ${tipo === op.val ? WINE : '#EDE0DB'}`,
                    background: tipo === op.val ? WINE_LIGHT : '#fff',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: tipo === op.val ? WINE : '#1A0A06' }}>{op.label}</div>
                  <div style={{ fontSize: 11, color: '#A0786A', marginTop: 2 }}>{op.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Insumo vinculado (solo sin_receta) */}
          {tipo === 'sin_receta' && (
            <div>
              <label style={labelStyle}>Insumo vinculado <span style={{ fontWeight: 400 }}>(opcional)</span></label>
              <select value={insumoId} onChange={e => setInsumoId(e.target.value)} style={inputStyle}>
                <option value="">Sin insumo vinculado</option>
                {insumos.map(i => (
                  <option key={i.id} value={i.id}>{i.nombre} ({i.unidad_medida}) — Stock: {i.stock_actual}</option>
                ))}
              </select>
            </div>
          )}

          <button type="submit" style={{ background: WINE, color: '#fff', border: 'none', borderRadius: 10, padding: '11px', fontSize: 13, fontWeight: 600, cursor: 'pointer', width: '100%', marginTop: 4 }}>
            Guardar cambios
          </button>
        </form>

        <button onClick={handleEliminar} style={{ background: 'none', color: '#EF4444', border: '1px solid #FECACA', borderRadius: 10, padding: '9px', fontSize: 13, fontWeight: 500, cursor: 'pointer', width: '100%', marginTop: 10 }}>
          Eliminar producto
        </button>
      </div>

      {/* Receta — solo si tipo es con_receta */}
      {tipo === 'con_receta' && (
        <div style={{ background: '#fff', border: '1px solid #EDE0DB', borderRadius: 16, padding: '24px' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#1A0A06', marginBottom: 4 }}>Receta</div>
          <div style={{ fontSize: 12, color: '#A0786A', marginBottom: 16 }}>
            Ingredientes que se descuentan del stock al vender este producto
          </div>

          {receta.length === 0 ? (
            <div style={{ fontSize: 13, color: '#C09080', marginBottom: 16 }}>Sin ingredientes configurados</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {receta.map(r => (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#F8F5F4', borderRadius: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1A0A06' }}>{r.insumo_nombre}</div>
                    {editandoRec === r.id ? (
                      <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                        <input
                          autoFocus
                          type="number"
                          value={editCantidad}
                          onChange={e => setEditCantidad(e.target.value)}
                          style={{ width: 80, padding: '5px 8px', border: '1px solid #EDE0DB', borderRadius: 7, fontSize: 12, outline: 'none', fontFamily: 'inherit' }}
                        />
                        <span style={{ fontSize: 11, color: '#A0786A', alignSelf: 'center' }}>{r.unidad_medida}</span>
                        <button onClick={() => handleGuardarIngrediente(r.id)} style={{ background: WINE, color: '#fff', border: 'none', borderRadius: 7, padding: '5px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>✓</button>
                        <button onClick={() => setEditandoRec(null)} style={{ background: 'none', color: '#A0786A', border: '1px solid #EDE0DB', borderRadius: 7, padding: '5px 8px', fontSize: 11, cursor: 'pointer' }}>✕</button>
                      </div>
                    ) : (
                      <div style={{ fontSize: 12, color: '#A0786A', marginTop: 2 }}>
                        {r.cantidad} {r.unidad_medida} por unidad
                      </div>
                    )}
                  </div>
                  {editandoRec !== r.id && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => { setEditandoRec(r.id); setEditCantidad(r.cantidad) }} style={{ background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: 7, padding: '5px 9px', fontSize: 12, cursor: 'pointer' }}>✎</button>
                      <button onClick={() => handleEliminarIngrediente(r.id)} style={{ background: '#FEF2F2', color: '#EF4444', border: 'none', borderRadius: 7, padding: '5px 9px', fontSize: 12, cursor: 'pointer' }}>✕</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Agregar ingrediente */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <div style={{ flex: 2 }}>
              <label style={labelStyle}>Insumo</label>
              <select value={insumoSel} onChange={e => setInsumoSel(e.target.value)} style={inputStyle}>
                <option value="">Seleccionar insumo</option>
                {insumos.map(i => (
                  <option key={i.id} value={i.id}>{i.nombre} ({i.unidad_medida})</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Cantidad</label>
              <input type="number" value={cantidadSel} onChange={e => setCantidadSel(e.target.value)} placeholder="0" style={inputStyle} />
            </div>
            <button
              onClick={handleAgregarIngrediente}
              disabled={!insumoSel || !cantidadSel}
              style={{
                background: insumoSel && cantidadSel ? WINE : '#E5D5D0',
                color: '#fff', border: 'none', borderRadius: 9,
                padding: '9px 16px', fontSize: 13, fontWeight: 600,
                cursor: insumoSel && cantidadSel ? 'pointer' : 'default',
                whiteSpace: 'nowrap', flexShrink: 0,
              }}
            >
              + Agregar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}