import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getInsumo, crearInsumo, agregarCompra, crearCategoria } from '../services/api'

function CategoriaInsumos() {
  const [insumos, setInsumos] = useState([])
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [nombre, setNombre] = useState('')
  const [precio, setPrecio] = useState(0)
  const [descripcion, setDescripcion] = useState('')
  const [cantidadCompra, setCantidadCompra] = useState({})
  const { categoriaId } = useParams()
  const navigate = useNavigate()

useEffect(() => {
  getInsumo(categoriaId).then(data => {
    setInsumos(data)
  })
}, [categoriaId])

  const handleCrearInsumo = () => {
    crearInsumo({
      nombre,
      precio: parseFloat(precio),
      descripcion,
      categoria_id: parseInt(categoriaId),
      stock_actual: 0,
      nro_insumo: insumos.length + 1
    }).then(() => {
      getInsumo(categoriaId).then(data => setInsumos(data))
      setNombre(''); setPrecio(0); setDescripcion('')
      setMostrarFormulario(false)
    })
  }

  const handleAgregarCompra = (insumoId) => {
    const cantidad = cantidadCompra[insumoId]
    if (!cantidad || cantidad <= 0) return
    agregarCompra(insumoId, cantidad).then(() => {
      getInsumo(categoriaId).then(data => setInsumos(data))
      setCantidadCompra({ ...cantidadCompra, [insumoId]: '' })
    })
  }

  const getStockBadge = (stock) => {
    if (stock <= 0) return { label: 'Sin stock', color: '#FCEBEB', textColor: '#791F1F' }
    if (stock <= 3) return { label: `Stock: ${stock}`, color: '#FAEEDA', textColor: '#633806' }
    return { label: `Stock: ${stock}`, color: '#EAF3DE', textColor: '#27500A' }
  }

  return (
    <div>
      <button onClick={() => navigate(-1)}>← Volver</button>
      <button onClick={() => navigate('/dashboard')}>Inicio</button>
      
      <h1>Insumos</h1>

      {insumos.map(insumo => {
        const badge = getStockBadge(insumo.stock_actual)
        return (
          <div key={insumo.id} style={{ border: '0.5px solid #ccc', borderRadius: 8, padding: 12, marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 500 }}>{insumo.nombre}</span>
            <span style={{ background: badge.color, color: badge.textColor, fontSize: 11, padding: '2px 8px', borderRadius: 20 }}>
              {badge.label}
            </span>
        </div>
            <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="number"
                placeholder="Cantidad"
                value={cantidadCompra[insumo.id] || ''}
                onChange={(e) => setCantidadCompra({ ...cantidadCompra, [insumo.id]: parseInt(e.target.value) })}
                style={{ width: 80 }}
                min="1"
              />
              <button onClick={() => handleAgregarCompra(insumo.id)}>+ Agregar compra</button>
              <button onClick={() => navigate(`/insumos/${categoriaId}/${insumo.id}`)}>Editar</button>
            </div>
          </div>
        )
      })}

      {mostrarFormulario ? (
        <div>
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre" />
          <input type="number" value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="Precio" />
          <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Descripción" />
          <button onClick={handleCrearInsumo}>Confirmar</button>
          <button onClick={() => setMostrarFormulario(false)}>Cancelar</button>
        </div>
      ) : (
        <button onClick={() => setMostrarFormulario(true)}>+ Agregar insumo</button>
      )}
    </div>
  )
}

export default CategoriaInsumos