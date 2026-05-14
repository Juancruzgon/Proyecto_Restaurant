import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getInsumo, modificarInsumo, eliminarInsumo, getCategoriasInsumo } from '../services/api'

const WINE       = '#7C2D12'
const WINE_LIGHT = '#FEF2EE'
const UNIDADES   = ['unidad', 'kg', 'gr', 'litros', 'ml', 'docena']

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

export default function EditarInsumo() {
  const { categoriaId, insumoId } = useParams()
  const navigate = useNavigate()

  const [insumo,        setInsumo]        = useState(null)
  const [nombre,        setNombre]        = useState('')
  const [precio,        setPrecio]        = useState('')
  const [descripcion,   setDescripcion]   = useState('')
  const [catId,         setCatId]         = useState('')
  const [unidadMedida,  setUnidadMedida]  = useState('unidad')
  const [categorias,    setCategorias]    = useState([])

  useEffect(() => {
    getInsumo(insumoId).then(data => {
      setInsumo(data)
      setNombre(data.nombre)
      setPrecio(data.precio)
      setDescripcion(data.descripcion || '')
      setCatId(data.categoria_id)
      setUnidadMedida(data.unidad_medida || 'unidad')
    })
    getCategoriasInsumo().then(data => setCategorias(data))
  }, [insumoId])

  const handleGuardar = () => {
    const datos = {}
    if (nombre)       datos.nombre        = nombre
    if (precio)       datos.precio        = parseFloat(precio)
    if (descripcion)  datos.descripcion   = descripcion
    if (catId)        datos.categoria_id  = parseInt(catId)
    datos.unidad_medida = unidadMedida
    modificarInsumo(insumoId, datos).then(() => navigate(`/insumos/${categoriaId}`))
  }

  const handleEliminar = () => {
    if (window.confirm('¿Eliminar este insumo?')) {
      eliminarInsumo(insumoId).then(() => navigate(`/insumos/${categoriaId}`))
    }
  }

  if (!insumo) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#A0786A', fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}>
      Cargando...
    </div>
  )

  return (
    <div style={{ padding: '28px 32px', fontFamily: "'DM Sans', sans-serif", maxWidth: 520 }}>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#1A0A06', letterSpacing: '-0.4px' }}>Editar insumo</div>
        <div style={{ fontSize: 13, color: '#A0786A', marginTop: 2 }}>{insumo.nombre}</div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #EDE0DB', borderRadius: 16, padding: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          <div>
            <label style={labelStyle}>Nombre</label>
            <input value={nombre} onChange={e => setNombre(e.target.value)} style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Precio</label>
            <input type="number" value={precio} onChange={e => setPrecio(e.target.value)} style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Unidad de medida</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {UNIDADES.map(u => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUnidadMedida(u)}
                  style={{
                    padding: '6px 14px', borderRadius: 20, cursor: 'pointer',
                    border: `1px solid ${unidadMedida === u ? WINE : '#EDE0DB'}`,
                    background: unidadMedida === u ? WINE_LIGHT : '#fff',
                    color: unidadMedida === u ? WINE : '#5C3A2E',
                    fontSize: 12, fontWeight: unidadMedida === u ? 600 : 400,
                  }}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Descripción</label>
            <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>

          <div>
            <label style={labelStyle}>Categoría</label>
            <select value={catId} onChange={e => setCatId(e.target.value)} style={inputStyle}>
              <option value="">Seleccionar categoría</option>
              {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>

          <button
            onClick={handleGuardar}
            style={{ background: WINE, color: '#fff', border: 'none', borderRadius: 10, padding: '11px', fontSize: 13, fontWeight: 600, cursor: 'pointer', width: '100%', marginTop: 4 }}
          >
            Guardar cambios
          </button>
        </div>

        <button
          onClick={handleEliminar}
          style={{ background: 'none', color: '#EF4444', border: '1px solid #FECACA', borderRadius: 10, padding: '9px', fontSize: 13, fontWeight: 500, cursor: 'pointer', width: '100%', marginTop: 10 }}
        >
          Eliminar insumo
        </button>
      </div>
    </div>
  )
}