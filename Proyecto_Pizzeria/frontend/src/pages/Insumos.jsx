import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCategoriasInsumo, crearCategoriaInsumo } from '../services/api'

const WINE       = '#7C2D12'
const WINE_LIGHT = '#FEF2EE'

export default function Insumos() {
  const navigate = useNavigate()
  const [categorias,        setCategorias]        = useState([])
  const [nombreCategoria,   setNombreCategoria]   = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)

  const cargar = () => getCategoriasInsumo().then(data => setCategorias(data))
  useEffect(() => { cargar() }, [])

  const handleCrear = () => {
    if (!nombreCategoria.trim()) return
    crearCategoriaInsumo({ nombre: nombreCategoria }).then(() => {
      cargar()
      setNombreCategoria('')
      setMostrarFormulario(false)
    })
  }

  return (
    <div style={{ padding: '28px 32px', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#1A0A06', letterSpacing: '-0.4px' }}>Insumos</div>
          <div style={{ fontSize: 13, color: '#A0786A', marginTop: 2 }}>{categorias.length} categorías</div>
        </div>
        <button
          onClick={() => setMostrarFormulario(true)}
          style={{ background: WINE, color: '#fff', border: 'none', borderRadius: 10, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
        >
          + Nueva categoría
        </button>
      </div>

      {/* Formulario */}
      {mostrarFormulario && (
        <div style={{ background: '#fff', border: `1px solid ${WINE}`, borderRadius: 14, padding: '18px 20px', marginBottom: 16, maxWidth: 480 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1A0A06', marginBottom: 12 }}>Nueva categoría</div>
          <input
            autoFocus
            value={nombreCategoria}
            onChange={e => setNombreCategoria(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCrear()}
            placeholder="Nombre de la categoría"
            style={{ width: '100%', padding: '9px 12px', border: '1px solid #EDE0DB', borderRadius: 9, fontSize: 13, outline: 'none', fontFamily: 'inherit', color: '#1A0A06', marginBottom: 12 }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleCrear} style={{ flex: 1, background: WINE, color: '#fff', border: 'none', borderRadius: 9, padding: '9px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Confirmar</button>
            <button onClick={() => { setMostrarFormulario(false); setNombreCategoria('') }} style={{ flex: 1, background: 'none', color: '#5C3A2E', border: '1px solid #EDE0DB', borderRadius: 9, padding: '9px', fontSize: 13, cursor: 'pointer' }}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Grid categorías */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
        {categorias.map(c => (
          <div
            key={c.id}
            style={{ background: '#fff', border: '1px solid #EDE0DB', borderRadius: 14, padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1A0A06' }}>{c.nombre}</div>
            <button
              onClick={() => navigate(`/insumos/${c.id}`)}
              style={{ background: WINE_LIGHT, color: WINE, border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
            >
              Ver →
            </button>
          </div>
        ))}

        {/* Card agregar */}
        {!mostrarFormulario && (
          <button
            onClick={() => setMostrarFormulario(true)}
            style={{ background: 'none', border: '2px dashed #EDE0DB', borderRadius: 14, padding: '16px 18px', cursor: 'pointer', color: '#C09080', fontSize: 13, fontWeight: 500, transition: 'all 0.15s' }}
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