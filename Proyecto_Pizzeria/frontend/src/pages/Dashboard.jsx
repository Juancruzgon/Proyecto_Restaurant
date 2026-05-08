import { useNavigate } from 'react-router-dom'

function Dashboard() {
  const navigate = useNavigate()
  const rolId = localStorage.getItem('rol_id')
  const nombre = localStorage.getItem('nombre')

  const cerrarSesion = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('rol_id')
    localStorage.removeItem('nombre')
    localStorage.removeItem('usuario_id')
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold !text-orange-500">Pizzería</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm">Bienvenido, {nombre}</span>
          <button
            onClick={cerrarSesion}
            className="text-sm text-red-500 border border-red-300 px-3 py-1 rounded-lg hover:bg-red-50 transition"
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto mt-10 px-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Menú principal</h2>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/mesas')}
            className="bg-white border border-gray-200 rounded-xl p-6 text-left hover:shadow-md transition"
          >
            <div className="text-2xl mb-2">🍕</div>
            <div className="font-semibold text-gray-700">Mesas</div>
          </button>
          <button
            onClick={() => navigate('/pedidos')}
            className="bg-white border border-gray-200 rounded-xl p-6 text-left hover:shadow-md transition"
          >
            <div className="text-2xl mb-2">📋</div>
            <div className="font-semibold text-gray-700">Pedidos</div>
          </button>

          {rolId === '1' && (
            <>
              <button
                onClick={() => navigate('/productos')}
                className="bg-white border border-gray-200 rounded-xl p-6 text-left hover:shadow-md transition"
              >
                <div className="text-2xl mb-2">🛒</div>
                <div className="font-semibold text-gray-700">Productos</div>
              </button>
              <button
                onClick={() => navigate('/usuarios')}
                className="bg-white border border-gray-200 rounded-xl p-6 text-left hover:shadow-md transition"
              >
                <div className="text-2xl mb-2">👥</div>
                <div className="font-semibold text-gray-700">Usuarios</div>
              </button>
              <button
                onClick={() => navigate('/gastos')}
                className="bg-white border border-gray-200 rounded-xl p-6 text-left hover:shadow-md transition"
              >
                <div className="text-2xl mb-2">💰</div>
                <div className="font-semibold text-gray-700">Gastos</div>
              </button>
              <button
                onClick={() => navigate('/insumos')}
                className="bg-white border border-gray-200 rounded-xl p-6 text-left hover:shadow-md transition"
              >
                <div className="text-2xl mb-2">📦</div>
                <div className="font-semibold text-gray-700">Insumos</div>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard