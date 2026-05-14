// EditarUsuario.jsx
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getUsuarioPorId, modificarUsuario, desactivarUsuario, getRoles } from '../services/api'

const WINE = '#7C2D12'

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

export default function EditarUsuario() {
  const { usuarioId } = useParams()
  const navigate      = useNavigate()

  const [usuario,  setUsuario]  = useState(null)
  const [nombre,   setNombre]   = useState('')
  const [apellido, setApellido] = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [rolId,    setRolId]    = useState('')
  const [roles,    setRoles]    = useState([])

  useEffect(() => {
    getUsuarioPorId(usuarioId).then(data => {
      setUsuario(data)
      setNombre(data.nombre)
      setApellido(data.apellido)
      setEmail(data.email)
      setRolId(data.rol_id)
    })
    getRoles().then(data => setRoles(data))
  }, [usuarioId])

  const handleGuardar = (e) => {
    e.preventDefault()
    const datos = { nombre, apellido, email, rol_id: parseInt(rolId) }
    if (password) datos.password = password
    modificarUsuario(usuarioId, datos).then(() => navigate('/usuarios'))
  }

  const handleDesactivar = () => {
    if (!window.confirm('¿Desactivar este usuario?')) return
    desactivarUsuario(usuarioId).then(() => navigate('/usuarios'))
  }

  if (!usuario) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#A0786A', fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}>
      Cargando...
    </div>
  )

  return (
    <div style={{ padding: '28px 32px', fontFamily: "'DM Sans', sans-serif", maxWidth: 520 }}>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#1A0A06', letterSpacing: '-0.4px' }}>Editar usuario</div>
        <div style={{ fontSize: 13, color: '#A0786A', marginTop: 2 }}>{usuario.nombre} {usuario.apellido}</div>
      </div>

      <div style={{ background: '#fff', border: '1px solid #EDE0DB', borderRadius: 16, padding: '24px' }}>
        <form onSubmit={handleGuardar} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Nombre</label>
              <input value={nombre} onChange={e => setNombre(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Apellido</label>
              <input value={apellido} onChange={e => setApellido(e.target.value)} style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Usuario (email)</label>
            <input type="text" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Nueva contraseña <span style={{ fontWeight: 400 }}>(opcional)</span></label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Dejar vacío para no cambiar" style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Rol</label>
            <select value={rolId} onChange={e => setRolId(e.target.value)} style={inputStyle}>
              <option value="">Seleccionar rol</option>
              {roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
            </select>
          </div>

          <button
            type="submit"
            style={{ background: WINE, color: '#fff', border: 'none', borderRadius: 10, padding: '11px', fontSize: 13, fontWeight: 600, cursor: 'pointer', width: '100%', marginTop: 4 }}
          >
            Guardar cambios
          </button>
        </form>

        <button
          onClick={handleDesactivar}
          style={{ background: 'none', color: '#EF4444', border: '1px solid #FECACA', borderRadius: 10, padding: '9px', fontSize: 13, fontWeight: 500, cursor: 'pointer', width: '100%', marginTop: 10 }}
        >
          Desactivar usuario
        </button>
      </div>
    </div>
  )
}