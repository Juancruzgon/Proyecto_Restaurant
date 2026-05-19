// Usuarios.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUsuarios, getRoles, crearUsuario } from '../services/api'

const WINE       = '#7C2D12'
const WINE_LIGHT = '#FEF2EE'

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

export default function Usuarios() {
  const navigate = useNavigate()
  const [usuarios,         setUsuarios]         = useState([])
  const [roles,            setRoles]            = useState([])
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [nombre,           setNombre]           = useState('')
  const [apellido,         setApellido]         = useState('')
  const [email,            setEmail]            = useState('')
  const [password,         setPassword]         = useState('')
  const [rolId,            setRolId]            = useState('')

  const cargar = () => {
    getUsuarios().then(data => setUsuarios(data))
    getRoles().then(data => setRoles(data))
  }
  useEffect(() => { cargar() }, [])

  const handleCrear = () => {
    if (!nombre.trim() || !email.trim() || !password.trim() || !rolId) return
    crearUsuario({ nombre, apellido, email, password, rol_id: parseInt(rolId) }).then(() => {
      cargar()
      setNombre(''); setApellido(''); setEmail(''); setPassword(''); setRolId('')
      setMostrarFormulario(false)
    })
  }

  return (
    <div style={{ padding: '28px 32px', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#1A0A06', letterSpacing: '-0.4px' }}>Usuarios</div>
          <div style={{ fontSize: 13, color: '#A0786A', marginTop: 2 }}>{usuarios.length} usuarios</div>
        </div>
        <button
          onClick={() => setMostrarFormulario(true)}
          style={{ background: WINE, color: '#fff', border: 'none', borderRadius: 10, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
        >
          + Nuevo usuario
        </button>
      </div>

      {/* Formulario nuevo usuario */}
      {mostrarFormulario && (
        <div style={{ background: '#fff', border: `1px solid ${WINE}`, borderRadius: 14, padding: '20px', marginBottom: 20, maxWidth: 480 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1A0A06', marginBottom: 16 }}>Nuevo usuario</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={labelStyle}>Nombre</label>
                <input autoFocus value={nombre} onChange={e => setNombre(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Apellido</label>
                <input value={apellido} onChange={e => setApellido(e.target.value)} style={inputStyle} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Usuario (email)</label>
              <input type="text" value={email} onChange={e => setEmail(e.target.value)} placeholder="ej: juan@pizzeria.com" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Contraseña</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Rol</label>
              <select value={rolId} onChange={e => setRolId(e.target.value)} style={inputStyle}>
                <option value="">Seleccionar rol</option>
                {roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button onClick={handleCrear} style={{ flex: 1, background: WINE, color: '#fff', border: 'none', borderRadius: 9, padding: '10px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Confirmar</button>
            <button onClick={() => { setMostrarFormulario(false); setNombre(''); setApellido(''); setEmail(''); setPassword(''); setRolId('') }} style={{ flex: 1, background: 'none', color: '#5C3A2E', border: '1px solid #EDE0DB', borderRadius: 9, padding: '10px', fontSize: 13, cursor: 'pointer' }}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Lista usuarios */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
        {usuarios.map(u => {
          const rol    = roles.find(r => r.id === u.rol_id)
          const inicial = u.nombre ? u.nombre.charAt(0).toUpperCase() : '?'
          return (
            <div key={u.id} style={{
              background: '#fff', border: '1px solid #EDE0DB',
              borderRadius: 14, padding: '16px 18px',
              display: 'flex', alignItems: 'center', gap: 14,
              opacity: u.activo ? 1 : 0.5,
            }}>
              <div style={{
                width: 42, height: 42, borderRadius: '50%',
                background: WINE_LIGHT,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, fontWeight: 700, color: WINE, flexShrink: 0,
              }}>
                {inicial}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1A0A06' }}>
                  {u.nombre} {u.apellido}
                  {!u.activo && <span style={{ fontSize: 10, color: '#9CA3AF', marginLeft: 6 }}>Inactivo</span>}
                </div>
                <div style={{ fontSize: 12, color: '#A0786A', marginTop: 1 }}>
                  {u.email} · {rol?.nombre || '—'}
                </div>
              </div>
              <button
                onClick={() => navigate(`/usuarios/${u.id}/editar`)}
                style={{ background: WINE_LIGHT, color: WINE, border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}
              >
                Editar
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}