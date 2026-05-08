import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCategoriasGasto, crearCategoriaGasto } from '../services/api'

function Gastos() {
  const [categorias, setCategorias] = useState([])
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [nombreCategoria, setNombreCategoria] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    getCategoriasGasto().then(data => setCategorias(data))
  }, [])

  const handleCrearCategoria = () => {
    crearCategoriaGasto({ nombre: nombreCategoria }).then(() => {
      getCategoriasGasto().then(data => setCategorias(data))
      setNombreCategoria('')
      setMostrarFormulario(false)
    })
  }

  return (
    <div>
      <button onClick={() => navigate(-1)}>← Volver</button>
      <h1>Gastos</h1>

      {categorias.map(c => (
        <div key={c.id}>
          <span>{c.nombre}</span>
          <button onClick={() => navigate(`/gastos/${c.id}`)}>Ver →</button>
        </div>
      ))}

      {mostrarFormulario ? (
        <div>
          <input value={nombreCategoria} onChange={(e) => setNombreCategoria(e.target.value)} placeholder="Nombre de la categoría" />
          <button onClick={handleCrearCategoria}>Confirmar</button>
          <button onClick={() => setMostrarFormulario(false)}>Cancelar</button>
        </div>
      ) : (
        <button onClick={() => setMostrarFormulario(true)}>+ Agregar categoría</button>
      )}
    </div>
  )
}

export default Gastos