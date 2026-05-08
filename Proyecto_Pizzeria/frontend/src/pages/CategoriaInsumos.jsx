import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getInsumo, crearInsumo, agregarCompra } from '../services/api'

function CategoriaInsumos() {
  const [insumos, setInsumos] = useState([])
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [nombre, setNombre] = useState('')
  const [precio, setPrecio] = useState(0)
  const [descripcion, setDescripcion] = useState('')
  const [cantidadCompra, setCantidadCompra] = useState({})
  const { categoriaId } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    getInsumo(categoriaId).then(data => setInsumos(data))
  }, [categoriaId])

  const handleCrearInsumo = () => {
    crearInsumo({
      nombre,
      precio: parseFloat(precio),
      descripcion,
      categoria_id: parseInt(categoriaId),
      stock_actual: 0,
      nro_insumo: insumos.length + 1
    }).then(() => {
      getInsumo(categoriaId).then(data => setInsumos(data))
      setNombre(''); setPrecio(0); setDescripcion('')
      setMostrarFormulario(false)
    })
  }

  const handleAgregarCompra = (insumoId) => {
    const cantidad = cantidadCompra[insumoId]
    if (!cantidad || cantidad <= 0) return
    agregarCompra(insumoId, cantidad).then(() => {
      getInsumo(categoriaId).then(data => setInsumos(data))
      setCantidadCompra({ ...cantidadCompra, [insumoId]: '' })
    })
  }

  const getStockClasses = (stock) => {
    if (stock <= 0) return 'bg-red-100 text-red-800'
    if (stock <= 3) return 'bg-yellow-100 text-yellow-800'
    return 'bg-green-100 text-green-800'
  }

  const getStockLabel = (stock) => {
    if (stock <= 0) return 'Sin stock'
    return `Stock: ${stock}`
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold !text-orange-500">Insumos</h1>
        <div className="flex gap-2">
          <button onClick={() => navigate(-1)} className="text-sm text-gray-500 border border-gray-300 px-3 py-1 rounded-lg hover:bg-gray-50 transition">← Volver</button>
          <button onClick={() => navigate('/dashboard')} className="text-sm text-gray-500 border border-gray-300 px-3 py-1 rounded-lg hover:bg-gray-50 transition">Inicio</button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto mt-6 px-4">
        <div className="flex flex-col gap-3 mb-4">
          {insumos.map(insumo => (
            <div key={insumo.id} className="bg-white rounded-xl border border-gray-200 px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-700">{insumo.nombre}</span>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStockClasses(insumo.stock_actual)}`}>
                  {getStockLabel(insumo.stock_actual)}
                </span>
              </div>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="Cantidad"
                  value={cantidadCompra[insumo.id] || ''}
                  onChange={(e) => setCantidadCompra({ ...cantidadCompra, [insumo.id]: parseInt(e.target.value) })}
                  min="1"
                  className="w-24 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <button
                  onClick={() => handleAgregarCompra(insumo.id)}
                  className="text-sm bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition"
                >
                  + Compra
                </button>
                <button
                  onClick={() => navigate(`/insumos/${categoriaId}/${insumo.id}`)}
                  className="text-sm text-orange-500 border border-orange-300 px-3 py-1.5 rounded-lg hover:bg-orange-50 transition"
                >
                  Editar
                </button>
              </div>
            </div>
          ))}
        </div>

        {mostrarFormulario ? (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h2 className="font-semibold text-gray-700 mb-3">Nuevo insumo</h2>
            <div className="flex flex-col gap-2 mb-3">
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              <input type="number" value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="Precio" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Descripción" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            </div>
            <div className="flex gap-2">
              <button onClick={handleCrearInsumo} className="flex-1 bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition text-sm">Confirmar</button>
              <button onClick={() => setMostrarFormulario(false)} className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg hover:bg-gray-50 transition text-sm">Cancelar</button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setMostrarFormulario(true)}
            className="w-full border-2 border-dashed border-gray-300 text-gray-400 py-3 rounded-xl hover:border-orange-400 hover:text-orange-400 transition"
          >
            + Agregar insumo
          </button>
        )}
      </div>
    </div>
  )
}

export default CategoriaInsumos