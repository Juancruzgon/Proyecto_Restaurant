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
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold !text-orange-500">Usuarios</h1>
        <div className="flex gap-2">
          <button onClick={() => navigate(-1)} className="text-sm text-gray-500 border border-gray-300 px-3 py-1 rounded-lg hover:bg-gray-50 transition">← Volver</button>
          <button onClick={() => navigate('/dashboard')} className="text-sm text-gray-500 border border-gray-300 px-3 py-1 rounded-lg hover:bg-gray-50 transition">Inicio</button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto mt-6 px-4">
        <div className="flex flex-col gap-3 mb-4">
          {usuarios.map(u => {
            const rol = roles.find(r => r.id === u.rol_id)
            return (
              <div key={u.id} className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-700">{u.nombre} {u.apellido}</p>
                  <p className="text-sm text-gray-500">{u.email} · {rol?.nombre}</p>
                </div>
                <button
                  onClick={() => navigate(`/usuarios/${u.id}/editar`)}
                  className="text-sm text-orange-500 border border-orange-300 px-3 py-1 rounded-lg hover:bg-orange-50 transition"
                >
                  Modificar
                </button>
              </div>
            )
          })}
        </div>

        {mostrarFormulario ? (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h2 className="font-semibold text-gray-700 mb-3">Nuevo usuario</h2>
            <div className="flex flex-col gap-2 mb-3">
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              <input value={apellido} onChange={(e) => setApellido(e.target.value)} placeholder="Apellido" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              <select value={rolId} onChange={(e) => setRolId(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                <option value="">Seleccionar rol</option>
                {roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={handleCrearUsuario} className="flex-1 bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition text-sm">Confirmar</button>
              <button onClick={() => setMostrarFormulario(false)} className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg hover:bg-gray-50 transition text-sm">Cancelar</button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setMostrarFormulario(true)}
            className="w-full border-2 border-dashed border-gray-300 text-gray-400 py-3 rounded-xl hover:border-orange-400 hover:text-orange-400 transition"
          >
            + Nuevo usuario
          </button>
        )}
      </div>
    </div>
  )
}

export default Usuarios