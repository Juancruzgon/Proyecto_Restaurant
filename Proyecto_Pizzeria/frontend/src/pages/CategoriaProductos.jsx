import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getProductos, crearProducto, getCategorias, crearCategoria, modificarCategoria, eliminarCategoria, getInsumos } from '../services/api'
import api from '../services/api'

const WINE       = '#7C2D12'
const WINE_LIGHT = '#FEF2EE'

const inputStyle = {
  width: '100%', padding: '9px 12px',
  border: '1px solid #EDE0DB', borderRadius: 9,
  fontSize: 13, outline: 'none',
  fontFamily: 'inherit', color: '#1A0A06',
  background: '#fff',
}

const labelStyle = {
  fontSize: 12, fontWeight: 600,
  color: '#A0786A', marginBottom: 5,
  display: 'block',
}

function fmtPeso(val) {
  return '$' + Number(val).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export default function CategoriaProductos() {
  const navigate        = useNavigate()
  const { categoriaId } = useParams()

  const [productos,     setProductos]     = useState([])
  const [subcategorias, setSubcategorias] = useState([])
  const [insumos,       setInsumos]       = useState([])

  // Formulario producto
  const [mostrarProducto, setMostrarProducto] = useState(false)
  const [nombre,          setNombre]          = useState('')
  const [precio,          setPrecio]          = useState('')
  const [descripcion,     setDescripcion]     = useState('')
  const [imagenUrl,       setImagenUrl]       = useState('')
  const [tipo,            setTipo]            = useState('sin_receta')
  const [insumoId,        setInsumoId]        = useState('')

  // Formulario subcategoría
  const [mostrarCategoria,    setMostrarCategoria]    = useState(false)
  const [nombreCategoria,     setNombreCategoria]     = useState('')
  const [imagenUrlCategoria,  setImagenUrlCategoria]  = useState('')
  const [categoriaEditando,   setCategoriaEditando]   = useState(null)
  const [nombreEditar,        setNombreEditar]        = useState('')
  const [imagenUrlEditar,     setImagenUrlEditar]     = useState('')

  const cargarDatos = () => {
    getProductos(categoriaId).then(data => setProductos(data))
    getCategorias(categoriaId).then(data => setSubcategorias(data))
  }

  useEffect(() => {
    cargarDatos()
    getInsumos().then(data => setInsumos(data))
  }, [categoriaId])

  const handleCrearProducto = async () => {
    if (!nombre.trim() || !precio) return
    await api.post('/productos/', {
      nombre,
      precio: parseFloat(precio),
      descripcion,
      imagen_url: imagenUrl || null,
      categoria_id: parseInt(categoriaId),
      tipo,
      insumo_id: tipo === 'sin_receta' && insumoId ? parseInt(insumoId) : null,
    })
    cargarDatos()
    setNombre(''); setPrecio(''); setDescripcion(''); setImagenUrl('')
    setTipo('sin_receta'); setInsumoId('')
    setMostrarProducto(false)
  }

  const handleCrearCategoria = () => {
    if (!nombreCategoria.trim()) return
    crearCategoria(nombreCategoria, '', categoriaId, imagenUrlCategoria || null).then(() => {
      cargarDatos()
      setNombreCategoria('')
      setImagenUrlCategoria('')
      setMostrarCategoria(false)
    })
  }

  const handleGuardarCategoria = (id) => {
    modificarCategoria(id, { nombre: nombreEditar, imagen_url: imagenUrlEditar || null }).then(() => {
      cargarDatos()
      setCategoriaEditando(null)
    })
  }

  const handleEliminarCategoria = (id) => {
    if (window.confirm('¿Eliminar esta categoría?')) {
      eliminarCategoria(id).then(() => cargarDatos())
    }
  }

  return (
    <div style={{ padding: '28px 32px', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#1A0A06', letterSpacing: '-0.4px' }}>Productos</div>
          <div style={{ fontSize: 13, color: '#A0786A', marginTop: 2 }}>
            {productos.length} productos · {subcategorias.length} subcategorías
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setMostrarCategoria(true)} style={{ background: '#fff', color: '#5C3A2E', border: '1px solid #EDE0DB', borderRadius: 10, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            + Subcategoría
          </button>
          <button onClick={() => setMostrarProducto(true)} style={{ background: WINE, color: '#fff', border: 'none', borderRadius: 10, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            + Producto
          </button>
        </div>
      </div>

      {/* Formulario nueva subcategoría */}
      {mostrarCategoria && (
        <div style={{ background: '#fff', border: '1px solid #EDE0DB', borderRadius: 14, padding: '18px 20px', marginBottom: 16, maxWidth: 480 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1A0A06', marginBottom: 12 }}>Nueva subcategoría</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
            <input autoFocus value={nombreCategoria} onChange={e => setNombreCategoria(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCrearCategoria()} placeholder="Nombre" style={inputStyle} />
            <input value={imagenUrlCategoria} onChange={e => setImagenUrlCategoria(e.target.value)} placeholder="URL de imagen (opcional)" style={inputStyle} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleCrearCategoria} style={{ flex: 1, background: WINE, color: '#fff', border: 'none', borderRadius: 9, padding: '9px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Confirmar</button>
            <button onClick={() => { setMostrarCategoria(false); setNombreCategoria(''); setImagenUrlCategoria('') }} style={{ flex: 1, background: 'none', color: '#5C3A2E', border: '1px solid #EDE0DB', borderRadius: 9, padding: '9px', fontSize: 13, cursor: 'pointer' }}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Formulario nuevo producto */}
      {mostrarProducto && (
        <div style={{ background: '#fff', border: `1px solid ${WINE}`, borderRadius: 14, padding: '20px', marginBottom: 20, maxWidth: 520 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1A0A06', marginBottom: 16 }}>Nuevo producto</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={labelStyle}>Nombre</label>
              <input autoFocus value={nombre} onChange={e => setNombre(e.target.value)} style={inputStyle} />
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
                <div style={{ marginTop: 8, height: 80, borderRadius: 9, overflow: 'hidden', border: '1px solid #EDE0DB' }}>
                  <img src={imagenUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
            </div>

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

            {/* Insumo vinculado — solo sin_receta */}
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

            {/* Aviso con_receta */}
            {tipo === 'con_receta' && (
              <div style={{ fontSize: 12, color: '#A0786A', background: '#F8F5F4', borderRadius: 8, padding: '8px 12px' }}>
                📝 Podés configurar la receta después de crear el producto desde "Modificar producto"
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button onClick={handleCrearProducto} style={{ flex: 1, background: WINE, color: '#fff', border: 'none', borderRadius: 9, padding: '10px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Confirmar</button>
            <button onClick={() => { setMostrarProducto(false); setNombre(''); setPrecio(''); setDescripcion(''); setImagenUrl(''); setTipo('sin_receta'); setInsumoId('') }} style={{ flex: 1, background: 'none', color: '#5C3A2E', border: '1px solid #EDE0DB', borderRadius: 9, padding: '10px', fontSize: 13, cursor: 'pointer' }}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Subcategorías */}
      {subcategorias.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#C09080', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Subcategorías</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
            {subcategorias.map(c => (
              <div key={c.id} style={{ background: '#fff', border: '1px solid #EDE0DB', borderRadius: 13, overflow: 'hidden' }}>
                {/* Imagen subcategoría */}
                <div style={{ height: 60, background: c.imagen_url ? 'transparent' : '#F8F5F4', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {c.imagen_url ? <img src={c.imagen_url} alt={c.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 22 }}>🍽️</span>}
                </div>
                <div style={{ padding: '12px 14px' }}>
                  {categoriaEditando === c.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                      <input autoFocus value={nombreEditar} onChange={e => setNombreEditar(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleGuardarCategoria(c.id)} placeholder="Nombre" style={{ width: '100%', padding: '6px 10px', border: '1px solid #EDE0DB', borderRadius: 7, fontSize: 13, outline: 'none', fontFamily: 'inherit', color: '#1A0A06' }} />
                      <input value={imagenUrlEditar} onChange={e => setImagenUrlEditar(e.target.value)} placeholder="URL imagen (opcional)" style={{ width: '100%', padding: '6px 10px', border: '1px solid #EDE0DB', borderRadius: 7, fontSize: 13, outline: 'none', fontFamily: 'inherit', color: '#1A0A06' }} />
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => handleGuardarCategoria(c.id)} style={{ flex: 1, background: WINE, color: '#fff', border: 'none', borderRadius: 7, padding: '6px 11px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Guardar</button>
                        <button onClick={() => setCategoriaEditando(null)} style={{ background: 'none', color: '#A0786A', border: '1px solid #EDE0DB', borderRadius: 7, padding: '6px 9px', fontSize: 12, cursor: 'pointer' }}>✕</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1A0A06' }}>{c.nombre}</div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => navigate(`/productos/${c.id}`)} style={{ background: WINE_LIGHT, color: WINE, border: 'none', borderRadius: 7, padding: '5px 11px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Ver →</button>
                        <button onClick={() => { setCategoriaEditando(c.id); setNombreEditar(c.nombre); setImagenUrlEditar(c.imagen_url || '') }} style={{ background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: 7, padding: '5px 9px', fontSize: 12, cursor: 'pointer' }}>✎</button>
                        <button onClick={() => handleEliminarCategoria(c.id)} style={{ background: '#FEF2F2', color: '#EF4444', border: 'none', borderRadius: 7, padding: '5px 9px', fontSize: 12, cursor: 'pointer' }}>✕</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Productos */}
      {productos.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#C09080', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Productos</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {productos.map(p => (
              <div key={p.id} style={{ background: '#fff', border: '1px solid #EDE0DB', borderRadius: 14, overflow: 'hidden', cursor: 'pointer', transition: 'box-shadow 0.15s' }}
                onClick={() => navigate(`/productos/${categoriaId}/${p.id}`)}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(124,45,18,0.10)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
              >
                <div style={{ height: 100, background: p.imagen_url ? 'transparent' : '#F8F5F4', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {p.imagen_url ? <img src={p.imagen_url} alt={p.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 32 }}>🍕</span>}
                </div>
                <div style={{ padding: '10px 12px 12px' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1A0A06', marginBottom: 2 }}>{p.nombre}</div>
                  {p.descripcion && <div style={{ fontSize: 11, color: '#A0786A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4 }}>{p.descripcion}</div>}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: WINE }}>{fmtPeso(p.precio)}</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {p.descuento > 0 && <span style={{ fontSize: 10, fontWeight: 600, background: WINE_LIGHT, color: WINE, borderRadius: 6, padding: '2px 7px' }}>-{p.descuento}%</span>}
                      <span style={{ fontSize: 10, fontWeight: 600, background: p.tipo === 'con_receta' ? '#EFF6FF' : '#F0FDF4', color: p.tipo === 'con_receta' ? '#1D4ED8' : '#16A34A', borderRadius: 6, padding: '2px 7px' }}>
                        {p.tipo === 'con_receta' ? 'Receta' : 'Simple'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {productos.length === 0 && subcategorias.length === 0 && !mostrarProducto && !mostrarCategoria && (
        <div style={{ textAlign: 'center', color: '#C09080', fontSize: 13, padding: '48px 0' }}>
          No hay productos ni subcategorías en esta categoría
        </div>
      )}
    </div>
  )
}