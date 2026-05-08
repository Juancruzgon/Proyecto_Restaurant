import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getGastos, crearGasto } from '../services/api'

function CategoriaGastos() {
  const [gastos, setGastos] = useState([])
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [monto, setMonto] = useState('')
  const { categoriaId } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    getGastos(categoriaId).then(data => setGastos(data))
  }, [categoriaId])

  const handleCrearGasto = () => {
    crearGasto({
      nombre,
      descripcion,
      monto: parseFloat(monto),
      categoria_id: parseInt(categoriaId)
    }).then(() => {
      getGastos(categoriaId).then(data => setGastos(data))
      setNombre(''); setDescripcion(''); setMonto('')
      setMostrarFormulario(false)
    })
  }

  const total = gastos.reduce((acc, g) => acc + parseFloat(g.monto), 0)

  return (
    <div>
      <button onClick={() => navigate(-1)}>← Volver</button>
      <h1>Gastos</h1>
      <p>Total: ${total.toFixed(2)}</p>

      {gastos.map(g => (
        <div key={g.id} style={{ border: '0.5px solid #ccc', borderRadius: 8, padding: 12, marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 500 }}>{g.nombre}</span>
            <span style={{ color: '#791F1F', fontWeight: 500 }}>-${g.monto}</span>
          </div>
          <div style={{ fontSize: 11, color: '#888' }}>{g.fecha}</div>
        </div>
      ))}

      {mostrarFormulario ? (
        <div>
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre" />
          <input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Descripción" />
          <input type="number" value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="Monto" />
          <button onClick={handleCrearGasto}>Confirmar</button>
          <button onClick={() => setMostrarFormulario(false)}>Cancelar</button>
        </div>
      ) : (
        <button onClick={() => setMostrarFormulario(true)}>+ Agregar gasto</button>
      )}
    </div>
  )
}

export default CategoriaGastos