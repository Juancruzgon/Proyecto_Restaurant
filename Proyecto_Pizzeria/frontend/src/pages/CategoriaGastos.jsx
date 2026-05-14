import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getGastos, crearGasto } from '../services/api'
import api from '../services/api'

const WINE       = '#7C2D12'
const WINE_LIGHT = '#FEF2EE'

const inputStyle = {
  width: '100%', padding: '9px 12px',
  border: '1px solid #EDE0DB', borderRadius: 9,
  fontSize: 13, outline: 'none',
  fontFamily: 'inherit', color: '#1A0A06', background: '#fff',
}

function fmtPeso(val) {
  return '$' + Number(val).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export default function CategoriaGastos() {
  const { categoriaId } = useParams()
  const navigate        = useNavigate()

  const [gastos,            setGastos]            = useState([])
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [nombre,            setNombre]            = useState('')
  const [descripcion,       setDescripcion]       = useState('')
  const [monto,             setMonto]             = useState('')

  // Edición inline
  const [editando,       setEditando]       = useState(null) // id del gasto editando
  const [editNombre,     setEditNombre]     = useState('')
  const [editDescripcion, setEditDescripcion] = useState('')
  const [editMonto,      setEditMonto]      = useState('')

  const cargar = () => getGastos(categoriaId).then(data => setGastos(data))
  useEffect(() => { cargar() }, [categoriaId])

  const handleCrear = () => {
    if (!nombre.trim() || !monto) return
    crearGasto({
      nombre,
      descripcion,
      monto: parseFloat(monto),
      categoria_id: parseInt(categoriaId),
    }).then(() => {
      cargar()
      setNombre(''); setDescripcion(''); setMonto('')
      setMostrarFormulario(false)
    })
  }

  const handleAbrirEdicion = (g) => {
    setEditando(g.id)
    setEditNombre(g.nombre)
    setEditDescripcion(g.descripcion || '')
    setEditMonto(g.monto)
  }

  const handleGuardar = async (id) => {
    await api.put(`/gastos/${id}`, {
      nombre:      editNombre,
      descripcion: editDescripcion,
      monto:       parseFloat(editMonto),
    })
    setEditando(null)
    cargar()
  }

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar este gasto?')) return
    await api.delete(`/gastos/${id}`)
    cargar()
  }

  const total = gastos.reduce((acc, g) => acc + parseFloat(g.monto), 0)

  return (
    <div style={{ padding: '28px 32px', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#1A0A06', letterSpacing: '-0.4px' }}>Gastos</div>
          <div style={{ fontSize: 13, color: '#A0786A', marginTop: 2 }}>{gastos.length} registros</div>
        </div>
        <button
          onClick={() => setMostrarFormulario(true)}
          style={{ background: WINE, color: '#fff', border: 'none', borderRadius: 10, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
        >
          + Nuevo gasto
        </button>
      </div>

      {/* Card total */}
      <div style={{ background: '#fff', border: '1px solid #EDE0DB', borderRadius: 14, padding: '16px 20px', marginBottom: 20, display: 'inline-flex', alignItems: 'center', gap: 40 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: '#A0786A' }}>Total de gastos</span>
        <span style={{ fontSize: 20, fontWeight: 800, color: '#EF4444', letterSpacing: '-0.5px' }}>-{fmtPeso(total)}</span>
      </div>

      {/* Formulario nuevo gasto */}
      {mostrarFormulario && (
        <div style={{ background: '#fff', border: `1px solid ${WINE}`, borderRadius: 14, padding: '20px', marginBottom: 20, maxWidth: 480 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1A0A06', marginBottom: 16 }}>Nuevo gasto</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#A0786A', marginBottom: 5 }}>Nombre</div>
              <input autoFocus value={nombre} onChange={e => setNombre(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#A0786A', marginBottom: 5 }}>Monto</div>
              <input type="number" value={monto} onChange={e => setMonto(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#A0786A', marginBottom: 5 }}>Descripción</div>
              <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button onClick={handleCrear} style={{ flex: 1, background: WINE, color: '#fff', border: 'none', borderRadius: 9, padding: '10px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Confirmar</button>
            <button onClick={() => { setMostrarFormulario(false); setNombre(''); setDescripcion(''); setMonto('') }} style={{ flex: 1, background: 'none', color: '#5C3A2E', border: '1px solid #EDE0DB', borderRadius: 9, padding: '10px', fontSize: 13, cursor: 'pointer' }}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Lista gastos */}
      {gastos.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#C09080', fontSize: 13, padding: '48px 0' }}>
          No hay gastos registrados en esta categoría
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {gastos.map(g => (
            <div key={g.id} style={{ background: '#fff', border: '1px solid #EDE0DB', borderRadius: 14, padding: '14px 18px' }}>
              {editando === g.id ? (
                // Modo edición
                <div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#A0786A', marginBottom: 4 }}>Nombre</div>
                      <input autoFocus value={editNombre} onChange={e => setEditNombre(e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#A0786A', marginBottom: 4 }}>Monto</div>
                      <input type="number" value={editMonto} onChange={e => setEditMonto(e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#A0786A', marginBottom: 4 }}>Descripción</div>
                      <textarea value={editDescripcion} onChange={e => setEditDescripcion(e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => handleGuardar(g.id)} style={{ flex: 1, background: WINE, color: '#fff', border: 'none', borderRadius: 9, padding: '8px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Guardar</button>
                    <button onClick={() => setEditando(null)} style={{ flex: 1, background: 'none', color: '#5C3A2E', border: '1px solid #EDE0DB', borderRadius: 9, padding: '8px', fontSize: 12, cursor: 'pointer' }}>Cancelar</button>
                  </div>
                </div>
              ) : (
                // Modo vista
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                    💸
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1A0A06' }}>{g.nombre}</div>
                    {g.descripcion && <div style={{ fontSize: 12, color: '#A0786A', marginTop: 1 }}>{g.descripcion}</div>}
                    <div style={{ fontSize: 11, color: '#C09080', marginTop: 2 }}>{g.fecha}</div>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#EF4444', flexShrink: 0 }}>
                    -{fmtPeso(g.monto)}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button
                      onClick={() => handleAbrirEdicion(g)}
                      style={{ background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: 7, padding: '6px 10px', fontSize: 12, cursor: 'pointer' }}
                    >✎</button>
                    <button
                      onClick={() => handleEliminar(g.id)}
                      style={{ background: '#FEF2F2', color: '#EF4444', border: 'none', borderRadius: 7, padding: '6px 10px', fontSize: 12, cursor: 'pointer' }}
                    >✕</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}