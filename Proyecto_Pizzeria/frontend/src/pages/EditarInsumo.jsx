import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getInsumoById, modificarInsumo, eliminarInsumo, getCategoriasInsumo } from '../services/api'
import api from '../services/api'

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
  const [imagenUrl,     setImagenUrl]     = useState('')
  const [categorias,    setCategorias]    = useState([])

  // Ajuste
  const [ajusteCantidad, setAjusteCantidad] = useState('')
  const [ajusteNota,     setAjusteNota]     = useState('')
  const [ajusteError,    setAjusteError]    = useState('')
  const [ajusteLoading,  setAjusteLoading]  = useState(false)

  const cargarInsumo = () => {
    getInsumoById(insumoId).then(data => {
      setInsumo(data)
      setNombre(data.nombre)
      setPrecio(data.precio)
      setDescripcion(data.descripcion || '')
      setCatId(data.categoria_id)
      setUnidadMedida(data.unidad_medida || 'unidad')
      setImagenUrl(data.imagen_url || '')
    })
  }

  useEffect(() => {
    cargarInsumo()
    getCategoriasInsumo().then(data => setCategorias(data))
  }, [insumoId])

  const handleGuardar = () => {
    const datos = {}
    if (nombre)      datos.nombre        = nombre
    if (precio)      datos.precio        = parseFloat(precio)
    if (descripcion) datos.descripcion   = descripcion
    if (catId)       datos.categoria_id  = parseInt(catId)
    datos.unidad_medida = unidadMedida
    datos.imagen_url    = imagenUrl.trim() || null
    modificarInsumo(insumoId, datos).then(() => navigate(`/insumos/${categoriaId}`))
  }

  const handleEliminar = () => {
    if (window.confirm('¿Eliminar este insumo?')) {
      eliminarInsumo(insumoId).then(() => navigate(`/insumos/${categoriaId}`))
    }
  }

  const handleAjuste = async () => {
    setAjusteError('')
    if (!ajusteCantidad || parseFloat(ajusteCantidad) === 0) { setAjusteError('Ingresá una cantidad distinta de 0'); return }
    if (!ajusteNota.trim()) { setAjusteError('La nota es obligatoria'); return }
    setAjusteLoading(true)
    try {
      await api.post(`/insumos/${insumoId}/ajuste`, {
        cantidad: parseFloat(ajusteCantidad),
        nota:     ajusteNota,
      })
      setAjusteCantidad('')
      setAjusteNota('')
      cargarInsumo()
    } catch (e) {
      setAjusteError(e.response?.data?.detail || 'Error al ajustar stock')
    } finally {
      setAjusteLoading(false)
    }
  }

  if (!insumo) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#A0786A', fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}>
      Cargando...
    </div>
  )

  return (
    <div style={{ padding: '28px 32px', fontFamily: "'DM Sans', sans-serif", maxWidth: 960 }}>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#1A0A06', letterSpacing: '-0.4px' }}>Editar insumo</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
          <div style={{ fontSize: 13, color: '#A0786A' }}>{insumo.nombre}</div>
          <div style={{ fontSize: 12, fontWeight: 700, padding: '2px 10px', borderRadius: 20, background: insumo.stock_actual <= 0 ? '#FEE2E2' : insumo.stock_actual <= 3 ? '#FEF9C3' : '#DCFCE7', color: insumo.stock_actual <= 0 ? '#991B1B' : insumo.stock_actual <= 3 ? '#854D0E' : '#166534' }}>
            Stock: {insumo.stock_actual} {insumo.unidad_medida}
          </div>
        </div>
      </div>

      {/* Formulario edición + Ajuste: 2 columnas en pantallas grandes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 16, alignItems: 'start' }}>

        {/* Formulario edición */}
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
            <div>
              <label style={labelStyle}>Categoría</label>
              <select value={catId} onChange={e => setCatId(e.target.value)} style={inputStyle}>
                <option value="">Seleccionar categoría</option>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>URL de imagen</label>
              <input value={imagenUrl} onChange={e => setImagenUrl(e.target.value)} placeholder="https://..." style={inputStyle} />
            </div>
            <button onClick={handleGuardar}
              style={{ background: WINE, color: '#fff', border: 'none', borderRadius: 10, padding: '11px', fontSize: 13, fontWeight: 600, cursor: 'pointer', width: '100%', marginTop: 4 }}>
              Guardar cambios
            </button>
          </div>
          <button onClick={handleEliminar}
            style={{ background: 'none', color: '#EF4444', border: '1px solid #FECACA', borderRadius: 10, padding: '9px', fontSize: 13, fontWeight: 500, cursor: 'pointer', width: '100%', marginTop: 10 }}>
            Eliminar insumo
          </button>
        </div>

        {/* Ajuste manual de stock */}
        <div style={{ background: '#fff', border: '1px solid #EDE0DB', borderRadius: 16, padding: '24px' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1A0A06', marginBottom: 4 }}>Ajuste manual de stock</div>
          <div style={{ fontSize: 12, color: '#A0786A', marginBottom: 16 }}>
            Usá valores positivos para sumar y negativos para restar. Ej: -2 para registrar una merma.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={labelStyle}>Cantidad ({insumo.unidad_medida})</label>
              <input
                type="number"
                step="0.01"
                value={ajusteCantidad}
                onChange={e => setAjusteCantidad(e.target.value)}
                placeholder="Ej: -2 o 5"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Nota <span style={{ fontWeight: 400 }}>(obligatoria)</span></label>
              <input
                value={ajusteNota}
                onChange={e => setAjusteNota(e.target.value)}
                placeholder="Ej: merma por vencimiento, conteo manual..."
                style={inputStyle}
              />
            </div>
            {ajusteError && (
              <div style={{ fontSize: 12, color: '#EF4444', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '8px 12px' }}>
                {ajusteError}
              </div>
            )}
            <button
              onClick={handleAjuste}
              disabled={ajusteLoading}
              style={{ background: ajusteCantidad && ajusteNota ? '#F59E0B' : '#E5D5D0', color: '#fff', border: 'none', borderRadius: 10, padding: '10px', fontSize: 13, fontWeight: 600, cursor: ajusteCantidad && ajusteNota ? 'pointer' : 'default', opacity: ajusteLoading ? 0.7 : 1 }}
            >
              {ajusteLoading ? 'Guardando...' : '✎ Confirmar ajuste'}
            </button>
          </div>
        </div>

      </div>{/* fin grid 2 columnas */}

    </div>
  )
}