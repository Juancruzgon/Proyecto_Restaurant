import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getProductoPorId, modificarUsuario, eliminarProducto} from '../services/api'

function ModificarProducto() {
  const [producto, setProducto] = useState(null)
  const [nombre, setNombre] = useState('')
  const [precio, setPrecio] = useState(0)
  const navigate = useNavigate()
  const { productoId } = useParams()

  useEffect(() => {
    getProductoPorId(productoId).then(data => {
      setProducto(data)
      setNombre(data.nombre)
      setPrecio(data.precio)
    })
  }, [productoId])

  const handleSubmit = (e) => {
    e.preventDefault()
    modificarProducto(productoId, { nombre, precio }).then(() => {
      navigate(`/productos/${producto.categoria_id}`)
    })
  }

const handleEliminar = () => {
  if (window.confirm('¿Estás seguro que querés eliminar este producto?')) {
    eliminarProducto(productoId).then(() => {
      navigate(`/productos/${producto.categoria_id}`)
    })
  }
}
  
  if (!producto) return <div>Cargando...</div>

  return (
    <div>
      <button onClick={() => navigate(-1)}>← Volver</button>
      <button onClick={() => navigate('/dashboard')}>Inicio</button>
      <h1>Modificar Producto</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nombre:</label>
          <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </div>
        <div>
          <label>Precio:</label>
          <input type="number" value={precio} onChange={(e) => setPrecio(e.target.value)} />
        </div>
        <button type="submit">Guardar Cambios</button>
      </form>
      <button onClick={handleEliminar}>Eliminar producto</button>
    </div>
  )
}

export default ModificarProducto