import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getUsuarioPorId, modificarUsuario, desactivarUsuario, getRoles } from '../services/api'

function EditarUsuario() {
  const [usuario, setUsuario] = useState(null)
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [rolId, setRolId] = useState('')
  const [roles, setRoles] = useState([])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const { usuarioId } = useParams()

  useEffect(() => {
    getUsuarioPorId(usuarioId).then(data => {
      setUsuario(data)
      setNombre(data.nombre)
      setEmail(data.email)
      setApellido(data.apellido)
      setRolId(data.rol_id)
    })
    getRoles().then(data => setRoles(data))
  }, [usuarioId])

  const handleSubmit = (e) => {
    e.preventDefault()
    const datos = { nombre, apellido, email, rol_id: parseInt(rolId) }
    if (password) datos.password = password
    modificarUsuario(usuarioId, datos).then(() => navigate('/usuarios'))
  }

  const handleDesactivar = () => {
    if (window.confirm('¿Estás seguro que querés desactivar este usuario?')) {
      desactivarUsuario(usuarioId).then(() => navigate('/usuarios'))
    }
  }

  if (!usuario) return <div>Cargando...</div>

  return (
    <div>
      <button onClick={() => navigate(-1)}>← Volver</button>
      <button onClick={() => navigate('/dashboard')}>Inicio</button>
      <h1>Modificar Usuario</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nombre:</label>
          <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </div>
        <div>
          <label>Apellido:</label>
          <input type="text" value={apellido} onChange={(e) => setApellido(e.target.value)} />
        </div>
        <div>
          <label>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label>Nueva contraseña:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Opcional" />
        </div>
        <div>
          <label>Rol:</label>
          <select value={rolId} onChange={(e) => setRolId(e.target.value)}>
            <option value="">Seleccionar rol</option>
            {roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
          </select>
        </div>
        <button type="submit">Guardar Cambios</button>
      </form>
      <button onClick={handleDesactivar}>Desactivar usuario</button>
    </div>
  )
}

export default EditarUsuario