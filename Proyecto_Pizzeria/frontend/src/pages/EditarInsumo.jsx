import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getInsumo, modificarInsumo, eliminarInsumo, getCategoriasInsumo } from '../services/api'

function EditarInsumo() {
  const { categoriaId, insumoId } = useParams()
  const navigate = useNavigate()
  const [insumo, setInsumo] = useState(null)
  const [nombre, setNombre] = useState('')
  const [precio, setPrecio] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [categorias, setCategorias] = useState([])
  const [categoriaId2, setCategoriaId2] = useState('')

  useEffect(() => {
    getInsumo(insumoId).then(data => {
      setInsumo(data)
      setNombre(data.nombre)
      setPrecio(data.precio)
      setDescripcion(data.descripcion || '')
      setCategoriaId2(data.categoria_id)
    })
    getCategoriasInsumo().then(data => setCategorias(data))
  }, [insumoId])

const handleGuardar = () => {
  const datos = {}
  if (nombre) datos.nombre = nombre
  if (precio) datos.precio = parseFloat(precio)
  if (descripcion) datos.descripcion = descripcion
  if (categoriaId2) datos.categoria_id = parseInt(categoriaId2)
  
  modificarInsumo(insumoId, datos).then(() => navigate(`/insumos/${categoriaId}`))
}

  const handleEliminar = () => {
    if (window.confirm('¿Estás seguro que querés eliminar este insumo?')) {
      eliminarInsumo(insumoId).then(() => navigate(`/insumos/${categoriaId}`))
    }
  }

  if (!insumo) return <div>Cargando...</div>

  return (
    <div>
      <button onClick={() => navigate(-1)}>← Volver</button>
      <button onClick={() => navigate('/dashboard')}>Inicio</button>
      <h1>Editar Insumo</h1>
      <div>
        <label>Nombre:</label>
        <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} />
      </div>
      <div>
        <label>Precio:</label>
        <input type="number" value={precio} onChange={(e) => setPrecio(e.target.value)} />
      </div>
      <div>
        <label>Descripción:</label>
        <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
      </div>
      <div>
        <label>Categoría:</label>
        <select value={categoriaId2} onChange={(e) => setCategoriaId2(e.target.value)}>
          <option value="">Seleccionar categoría</option>
          {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
      </div>
      <button onClick={handleGuardar}>Guardar</button>
      <button onClick={handleEliminar}>Eliminar insumo</button>
    </div>
  )
}

export default EditarInsumo