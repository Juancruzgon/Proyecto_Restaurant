import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCategoriasInsumo, crearCategoriaInsumo, crearCategoria } from '../services/api'

function Insumos() {
  const [categorias, setCategorias] = useState([])
  const [nombreCategoria, setNombreCategoria] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    getCategoriasInsumo().then(data => setCategorias(data))
  }, [])

  const handleCrearCategoria = () => {
    crearCategoriaInsumo({ nombre: nombreCategoria }).then(() => {
      getCategoriasInsumo().then(data => setCategorias(data))
      setNombreCategoria('')
      setMostrarFormulario(false)
    })
  }

  return (
    <div>
      <button onClick={() => navigate(-1)}>← Volver</button>
      <button onClick={() => navigate('/dashboard')}>Inicio</button>
      <h1>Insumos</h1>

      {categorias.map(c => (
        <div key={c.id}>
          <span>{c.nombre}</span>
          <button onClick={() => navigate(`/insumos/${c.id}`)}>Ver →</button>
        </div>
      ))}

      {mostrarFormulario ? (
        <div>
          <input
            value={nombreCategoria}
            onChange={(e) => setNombreCategoria(e.target.value)}
            placeholder="Nombre de la categoría"
          />
          <button onClick={handleCrearCategoria}>Confirmar</button>
          <button onClick={() => setMostrarFormulario(false)}>Cancelar</button>
        </div>
      ) : (
        <button onClick={() => setMostrarFormulario(true)}>+ Agregar categoría</button>
      )}
    </div>
  )
}

export default Insumos