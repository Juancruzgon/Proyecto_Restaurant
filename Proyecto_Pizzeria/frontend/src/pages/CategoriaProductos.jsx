import { getProductos, crearProducto } from '../services/api'
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

function CategoriaProductos() {
  const [productos, setProductos] = useState([])
  const [nombre, setNombre] = useState('')
  const [precio, setPrecio] = useState(0)
  const [descripcion, setDescripcion] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const { categoriaId } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    getProductos(categoriaId).then(data => setProductos(data))
  }, [categoriaId])

  const handleCrearProducto = () => {
    crearProducto(nombre, precio, descripcion, categoriaId).then(() => {
      getProductos(categoriaId).then(data => setProductos(data))
      setNombre('')
      setPrecio(0)
      setDescripcion('')
      setMostrarFormulario(false)
    })
  }

  return (
    <div>
      <button onClick={() => navigate(-1)}>← Volver</button>
      <button onClick={() => navigate('/dashboard')}>Inicio</button>
      <h1>Productos de la categoría</h1>
      {productos.map(producto => (
        <div key={producto.id}>
          <span>{producto.nombre} - ${producto.precio}</span>
          <button onClick={() => navigate(`/productos/${categoriaId}/${producto.id}`)}>
            Modificar
          </button>
        </div>
      ))}

      {mostrarFormulario ? (
        <div>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre del producto"
          />
          <input
            type="number"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            placeholder="Precio"
          />
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Descripción"
          />
          <button onClick={handleCrearProducto}>Confirmar</button>
          <button onClick={() => setMostrarFormulario(false)}>Cancelar</button>
        </div>
      ) : (
        <button onClick={() => setMostrarFormulario(true)}>+ Agregar producto</button>
      )}
    </div>
  )
}

export default CategoriaProductos