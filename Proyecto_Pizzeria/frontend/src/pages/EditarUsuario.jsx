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

  if (!usuario) return <div className="flex items-center justify-center min-h-screen text-gray-500">Cargando...</div>

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold !text-orange-500">Modificar Usuario</h1>
        <div className="flex gap-2">
          <button onClick={() => navigate(-1)} className="text-sm text-gray-500 border border-gray-300 px-3 py-1 rounded-lg hover:bg-gray-50 transition">← Volver</button>
          <button onClick={() => navigate('/dashboard')} className="text-sm text-gray-500 border border-gray-300 px-3 py-1 rounded-lg hover:bg-gray-50 transition">Inicio</button>
        </div>
      </div>

      <div className="max-w-sm mx-auto mt-8 px-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Nombre</label>
              <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Apellido</label>
              <input type="text" value={apellido} onChange={(e) => setApellido(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Nueva contraseña (opcional)</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Dejar vacío para no cambiar" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Rol</label>
              <select value={rolId} onChange={(e) => setRolId(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                <option value="">Seleccionar rol</option>
                {roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
              </select>
            </div>
            <button type="submit" className="w-full bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition">
              Guardar cambios
            </button>
          </form>
          <button onClick={handleDesactivar} className="w-full mt-3 border border-red-300 text-red-500 py-2 rounded-lg hover:bg-red-50 transition text-sm">
            Desactivar usuario
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditarUsuario