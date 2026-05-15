import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCategorias, crearCategoria, modificarCategoria, eliminarCategoria } from '../services/api'

const WINE       = '#7C2D12'
const WINE_LIGHT = '#FEF2EE'

const inputStyle = {
  width: '100%', padding: '9px 12px',
  border: '1px solid #EDE0DB', borderRadius: 9,
  fontSize: 13, outline: 'none',
  fontFamily: 'inherit', color: '#1A0A06', background: '#fff',
}

export default function Productos() {
  const navigate = useNavigate()
  const [categorias,        setCategorias]        = useState([])
  const [nombreCategoria,   setNombreCategoria]   = useState('')
  const [imagenUrlNueva,    setImagenUrlNueva]    = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [categoriaEditando, setCategoriaEditando] = useState(null)
  const [nombreEditar,      setNombreEditar]      = useState('')
  const [imagenUrlEditar,   setImagenUrlEditar]   = useState('')

  const cargarCategorias = () => getCategorias().then(data => setCategorias(data))
  useEffect(() => { cargarCategorias() }, [])

  const handleCrear = () => {
    if (!nombreCategoria.trim()) return
    crearCategoria(nombreCategoria, '', null, imagenUrlNueva || null).then(() => {
      cargarCategorias()
      setNombreCategoria('')
      setImagenUrlNueva('')
      setMostrarFormulario(false)
    })
  }

  const handleGuardar = (id) => {
    modificarCategoria(id, { nombre: nombreEditar, imagen_url: imagenUrlEditar || null }).then(() => {
      cargarCategorias()
      setCategoriaEditando(null)
    })
  }

  const handleEliminar = (id) => {
    if (window.confirm('¿Eliminar esta categoría?')) {
      eliminarCategoria(id).then(() => cargarCategorias())
    }
  }

  return (
    <div style={{ padding: '28px 32px', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#1A0A06', letterSpacing: '-0.4px' }}>Productos</div>
          <div style={{ fontSize: 13, color: '#A0786A', marginTop: 2 }}>{categorias.length} categorías</div>
        </div>
        <button
          onClick={() => setMostrarFormulario(true)}
          style={{ background: WINE, color: '#fff', border: 'none', borderRadius: 10, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
        >
          + Nueva categoría
        </button>
      </div>

      {/* Formulario nueva categoría */}
      {mostrarFormulario && (
        <div style={{ background: '#fff', border: `1px solid ${WINE}`, borderRadius: 14, padding: '18px 20px', marginBottom: 16, maxWidth: 480 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1A0A06', marginBottom: 12 }}>Nueva categoría</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
            <input
              autoFocus
              value={nombreCategoria}
              onChange={e => setNombreCategoria(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCrear()}
              placeholder="Nombre de la categoría"
              style={inputStyle}
            />
            <input
              value={imagenUrlNueva}
              onChange={e => setImagenUrlNueva(e.target.value)}
              placeholder="URL de imagen (opcional)"
              style={inputStyle}
            />
            {imagenUrlNueva && (
              <div style={{ height: 70, borderRadius: 8, overflow: 'hidden', border: '1px solid #EDE0DB' }}>
                <img src={imagenUrlNueva} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleCrear}
              style={{ flex: 1, background: WINE, color: '#fff', border: 'none', borderRadius: 9, padding: '9px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >Confirmar</button>
            <button
              onClick={() => { setMostrarFormulario(false); setNombreCategoria(''); setImagenUrlNueva('') }}
              style={{ flex: 1, background: 'none', color: '#5C3A2E', border: '1px solid #EDE0DB', borderRadius: 9, padding: '9px', fontSize: 13, cursor: 'pointer' }}
            >Cancelar</button>
          </div>
        </div>
      )}

      {/* Lista categorías */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
        {categorias.map(c => (
          <div
            key={c.id}
            style={{ background: '#fff', border: '1px solid #EDE0DB', borderRadius: 14, overflow: 'hidden' }}
          >
            {/* Imagen / placeholder */}
            <div style={{ height: 80, background: c.imagen_url ? 'transparent' : '#F8F5F4', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {c.imagen_url
                ? <img src={c.imagen_url} alt={c.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontSize: 30 }}>🍽️</span>
              }
            </div>

            <div style={{ padding: '14px 16px' }}>
              {categoriaEditando === c.id ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input
                    autoFocus
                    value={nombreEditar}
                    onChange={e => setNombreEditar(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleGuardar(c.id)}
                    placeholder="Nombre"
                    style={{ width: '100%', padding: '7px 10px', border: '1px solid #EDE0DB', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'inherit', color: '#1A0A06' }}
                  />
                  <input
                    value={imagenUrlEditar}
                    onChange={e => setImagenUrlEditar(e.target.value)}
                    placeholder="URL de imagen (opcional)"
                    style={{ width: '100%', padding: '7px 10px', border: '1px solid #EDE0DB', borderRadius: 8, fontSize: 13, outline: 'none', fontFamily: 'inherit', color: '#1A0A06' }}
                  />
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => handleGuardar(c.id)}
                      style={{ flex: 1, background: WINE, color: '#fff', border: 'none', borderRadius: 8, padding: '7px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                    >Guardar</button>
                    <button
                      onClick={() => setCategoriaEditando(null)}
                      style={{ background: 'none', color: '#A0786A', border: '1px solid #EDE0DB', borderRadius: 8, padding: '7px 10px', fontSize: 12, cursor: 'pointer' }}
                    >✕</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1A0A06' }}>{c.nombre}</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => navigate(`/productos/${c.id}`)}
                      style={{ background: WINE_LIGHT, color: WINE, border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                    >Ver →</button>
                    <button
                      onClick={() => { setCategoriaEditando(c.id); setNombreEditar(c.nombre); setImagenUrlEditar(c.imagen_url || '') }}
                      style={{ background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: 8, padding: '6px 10px', fontSize: 12, cursor: 'pointer' }}
                    >✎</button>
                    <button
                      onClick={() => handleEliminar(c.id)}
                      style={{ background: '#FEF2F2', color: '#EF4444', border: 'none', borderRadius: 8, padding: '6px 10px', fontSize: 12, cursor: 'pointer' }}
                    >✕</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Card agregar */}
        {!mostrarFormulario && (
          <button
            onClick={() => setMostrarFormulario(true)}
            style={{ background: 'none', border: '2px dashed #EDE0DB', borderRadius: 14, padding: '16px 18px', cursor: 'pointer', color: '#C09080', fontSize: 13, fontWeight: 500, transition: 'all 0.15s', minHeight: 160 }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = WINE; e.currentTarget.style.color = WINE }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#EDE0DB'; e.currentTarget.style.color = '#C09080' }}
          >
            + Agregar categoría
          </button>
        )}
      </div>
    </div>
  )
}
