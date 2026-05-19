import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCategoriasGasto, crearCategoriaGasto, getGastos } from '../services/api'

const WINE       = '#7C2D12'
const WINE_LIGHT = '#FEF2EE'

function fmtPeso(val) {
  return '$' + Number(val).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export default function Gastos() {
  const navigate = useNavigate()
  const [categorias,        setCategorias]        = useState([])
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [nombreCategoria,   setNombreCategoria]   = useState('')
  const [imagenUrl,         setImagenUrl]         = useState('')
  const [todosGastos,       setTodosGastos]       = useState([])
  const [mostrarTodos,      setMostrarTodos]      = useState(false)

  const cargar = () => getCategoriasGasto().then(data => setCategorias(data))
  useEffect(() => { cargar() }, [])

  const handleCrear = () => {
    if (!nombreCategoria.trim()) return
    crearCategoriaGasto({ nombre: nombreCategoria, imagen_url: imagenUrl.trim() || null }).then(() => {
      cargar()
      setNombreCategoria('')
      setImagenUrl('')
      setMostrarFormulario(false)
    })
  }

  const cargarTodos = () => {
    if (!mostrarTodos) {
      getGastos().then(data => setTodosGastos(data))
    }
    setMostrarTodos(v => !v)
  }

  const totalTodos = todosGastos.reduce((acc, g) => acc + parseFloat(g.monto), 0)

  return (
    <div style={{ padding: '28px 32px', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#1A0A06', letterSpacing: '-0.4px' }}>Gastos</div>
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
          <input
            autoFocus
            value={nombreCategoria}
            onChange={e => setNombreCategoria(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCrear()}
            placeholder="Nombre de la categoría"
            style={{ width: '100%', padding: '9px 12px', border: '1px solid #EDE0DB', borderRadius: 9, fontSize: 13, outline: 'none', fontFamily: 'inherit', color: '#1A0A06', marginBottom: 10 }}
          />
          <input
            value={imagenUrl}
            onChange={e => setImagenUrl(e.target.value)}
            placeholder="URL de imagen (opcional)"
            style={{ width: '100%', padding: '9px 12px', border: '1px solid #EDE0DB', borderRadius: 9, fontSize: 13, outline: 'none', fontFamily: 'inherit', color: '#1A0A06', marginBottom: 12 }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleCrear} style={{ flex: 1, background: WINE, color: '#fff', border: 'none', borderRadius: 9, padding: '9px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Confirmar</button>
            <button onClick={() => { setMostrarFormulario(false); setNombreCategoria(''); setImagenUrl('') }} style={{ flex: 1, background: 'none', color: '#5C3A2E', border: '1px solid #EDE0DB', borderRadius: 9, padding: '9px', fontSize: 13, cursor: 'pointer' }}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Grid categorías */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
        {categorias.map(c => (
          <div key={c.id} style={{ background: '#fff', border: '1px solid #EDE0DB', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
              {c.imagen_url
                ? <img src={c.imagen_url} alt="" style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                : <div style={{ width: 48, height: 48, borderRadius: 10, background: '#FEF2EE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>💸</div>
              }
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1A0A06', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.nombre}</div>
            </div>
            <button
              onClick={() => navigate(`/gastos/${c.id}`)}
              style={{ background: WINE_LIGHT, color: WINE, border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}
            >
              Ver →
            </button>
          </div>
        ))}

        {!mostrarFormulario && (
          <button
            onClick={() => setMostrarFormulario(true)}
            style={{ background: 'none', border: '2px dashed #EDE0DB', borderRadius: 14, padding: '16px 18px', cursor: 'pointer', color: '#C09080', fontSize: 13, fontWeight: 500 }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = WINE; e.currentTarget.style.color = WINE }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#EDE0DB'; e.currentTarget.style.color = '#C09080' }}
          >
            + Agregar categoría
          </button>
        )}
      </div>

      {/* Ver todos */}
      <div style={{ marginTop: 28 }}>
        <button
          onClick={cargarTodos}
          style={{
            background: mostrarTodos ? '#F8F5F4' : 'none',
            color: WINE, border: `1px solid ${WINE}`,
            borderRadius: 10, padding: '8px 18px',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}
        >
          {mostrarTodos ? 'Ocultar todos ↑' : 'Ver todos los gastos ↓'}
        </button>
      </div>

      {mostrarTodos && (
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#C09080', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Todos los gastos
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#EF4444' }}>
              -{fmtPeso(totalTodos)}
            </div>
          </div>

          {todosGastos.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#C09080', fontSize: 13, padding: '32px 0' }}>
              No hay gastos registrados
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {todosGastos.map(g => (
                <div key={g.id} style={{ background: '#fff', border: '1px solid #EDE0DB', borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                    💸
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1A0A06' }}>{g.nombre}</div>
                    {g.descripcion && <div style={{ fontSize: 12, color: '#A0786A', marginTop: 1 }}>{g.descripcion}</div>}
                    <div style={{ fontSize: 11, color: '#C09080', marginTop: 2 }}>{g.fecha}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#EF4444' }}>-{fmtPeso(g.monto)}</div>
                    <div style={{ fontSize: 11, color: '#A0786A', marginTop: 2 }}>{categorias.find(c => c.id === g.categoria_id)?.nombre || ''}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}