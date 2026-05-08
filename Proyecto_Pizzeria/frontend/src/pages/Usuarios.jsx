import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUsuarios, getRoles, crearUsuario } from '../services/api'

function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [roles, setRoles] = useState([])
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rolId, setRolId] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    getUsuarios().then(data => setUsuarios(data))
    getRoles().then(data => setRoles(data))
  }, [])

  const handleCrearUsuario = () => {
    crearUsuario({ nombre, apellido, email, password, rol_id: parseInt(rolId) }).then(() => {
      getUsuarios().then(data => setUsuarios(data))
      setNombre(''); setApellido(''); setEmail(''); setPassword(''); setRolId('')
      setMostrarFormulario(false)
    })
  }

  return (
    <div>
      <button onClick={() => navigate(-1)}>← Volver</button>
      <button onClick={() => navigate('/dashboard')}>Inicio</button>
      <h1>Usuarios</h1>
      {usuarios.map(u => {
        const rol = roles.find(r => r.id === u.rol_id)
        return (
          <div key={u.id}>
            <span>{u.nombre} {u.apellido} — {u.email} — {rol?.nombre}</span>
            <button onClick={() => navigate(`/usuarios/${u.id}/editar`)}>Modificar</button>
          </div>
        )
      })}

      {mostrarFormulario ? (
        <div>
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre" />
          <input value={apellido} onChange={(e) => setApellido(e.target.value)} placeholder="Apellido" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" />
          <select value={rolId} onChange={(e) => setRolId(e.target.value)}>
            <option value="">Seleccionar rol</option>
            {roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
          </select>
          <button onClick={handleCrearUsuario}>Confirmar</button>
          <button onClick={() => setMostrarFormulario(false)}>Cancelar</button>
        </div>
      ) : (
        <button onClick={() => setMostrarFormulario(true)}>+ Nuevo usuario</button>
      )}
    </div>
  )
}

export default Usuarios