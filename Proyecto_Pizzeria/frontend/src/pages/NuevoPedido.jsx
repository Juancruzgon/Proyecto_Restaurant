import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api, { getSalones, getMesas, getCajaActiva } from '../services/api'
import ModalPedido from '../components/ModalPedido'

const WINE = '#7C2D12'
const WINE_LIGHT = '#FEF2EE'

/* MÁS GRANDES */
const MESA_W = 110
const MESA_H = 110
const GRID_GAP = 28
const COLS = 7

function posInicial(index) {
  const col = index % COLS
  const row = Math.floor(index / COLS)

  return {
    x: GRID_GAP + col * (MESA_W + GRID_GAP),
    y: GRID_GAP + row * (MESA_H + GRID_GAP),
  }
}

const TIPOS = [
  { id: 'Salon', icon: '🍽️', label: 'Salón', desc: 'Mesa en el salón' },
  { id: 'Takeaway', icon: '🥡', label: 'Takeaway', desc: 'Retira en el mostrador' },
  { id: 'Delivery', icon: '🛵', label: 'Delivery', desc: 'Envío a domicilio' },
]

export default function NuevoPedido() {
  const navigate = useNavigate()

  const [tipo, setTipo] = useState(null)
  const [salones, setSalones] = useState([])
  const [salonActivo, setSalonActivo] = useState(null)
  const [mesas, setMesas] = useState([])
  const [pedidosActivos, setPedidosActivos] = useState([])
  const [modalPedido, setModalPedido] = useState(null)

  const [pager, setPager] = useState('')

  const [nombreCliente, setNombreCliente] = useState('')
  const [telefonoCliente, setTelefonoCliente] = useState('')
  const [direccionCliente, setDireccionCliente] = useState('')

  const [caja, setCaja] = useState(undefined)

  const posiciones = useRef({})

  useEffect(() => {
    getSalones().then(data => {
      setSalones(data)

      if (data.length > 0) {
        setSalonActivo(data[0].id)
      }
    })

    getCajaActiva()
      .then(data => setCaja(data))
      .catch(() => setCaja(null))
  }, [])

  const cargarMesas = useCallback(async (salonId) => {
    const [data, resPedidos] = await Promise.all([
      getMesas(salonId),
      api.get('/pedidos/'),
    ])

    setMesas(data)

    setPedidosActivos(
      resPedidos.data.filter(p => p.activo)
    )

    data.forEach((m, i) => {
      posiciones.current[m.id] =
        (m.pos_x != null && m.pos_y != null)
          ? { x: m.pos_x, y: m.pos_y }
          : posInicial(i)
    })

  }, [])

  useEffect(() => {
    if (tipo === 'Salon' && salonActivo) {
      cargarMesas(salonActivo)
    }
  }, [tipo, salonActivo, cargarMesas])

  const handleClickMesa = (mesa) => {
    if (mesa.estado_id === 1) {
      navigate(`/pedido/${mesa.id}?tipo=Salon`)
    } else {
      const pedido = pedidosActivos.find(
        p => p.mesa_id === mesa.id
      )

      if (pedido) {
        setModalPedido(pedido)
      }
    }
  }

  const handleIrDelivery = () => {
    const params = new URLSearchParams({
      tipo: 'Delivery',
    })

    if (nombreCliente.trim()) {
      params.set('nombre', nombreCliente.trim())
    }

    if (telefonoCliente.trim()) {
      params.set('telefono', telefonoCliente.trim())
    }

    if (direccionCliente.trim()) {
      params.set('direccion', direccionCliente.trim())
    }

    navigate(`/pedido/nuevo?${params.toString()}`)
  }

  const handleIrTakeaway = () => {
    if (!pager.trim()) return

    navigate(
      `/pedido/nuevo?tipo=Takeaway&pager=${encodeURIComponent(pager.trim())}`
    )
  }

  const mesasDelSalon = mesas.filter(
    m => m.salon_id === salonActivo
  )

  const salonActual = salones.find(
    s => s.id === salonActivo
  )

const canvasW = parseInt(salonActual?.ancho) || 1400
const canvasH = parseInt(salonActual?.alto) || 850

const containerWidth = Math.max(window.innerWidth - 380, 320)
const maxCanvasHeight = 460

const scale = Math.min(
  containerWidth / canvasW,
  maxCanvasHeight / canvasH,
  1
)

const canvasDisplayW = canvasW * scale
const canvasDisplayH = canvasH * scale

  if (caja === undefined) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '60vh',
          color: '#A0786A',
          fontSize: 14,
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        Cargando...
      </div>
    )
  }

  if (!caja?.id) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '60vh',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <div
          style={{
            textAlign: 'center',
            maxWidth: 380,
          }}
        >
          <div
            style={{
              fontSize: 48,
              marginBottom: 16,
            }}
          >
            🔒
          </div>

          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: '#1A0A06',
              marginBottom: 8,
            }}
          >
            Caja cerrada
          </div>

          <div
            style={{
              fontSize: 14,
              color: '#A0786A',
              lineHeight: 1.5,
            }}
          >
            No hay caja abierta. Pedí al admin que abra
            la caja para comenzar a operar.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        padding: '28px 32px',
        fontFamily: "'DM Sans', sans-serif",

        /* CAMBIO CLAVE */
        width: '100%',
        maxWidth: '100%',
        minHeight: '100vh',
        boxSizing: 'border-box',
      }}
    >

      {/* HEADER */}
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: '#1A0A06',
            letterSpacing: '-0.4px',
          }}
        >
          Nuevo pedido
        </div>

        <div
          style={{
            fontSize: 13,
            color: '#A0786A',
            marginTop: 2,
          }}
        >
          Seleccioná el tipo de pedido para continuar
        </div>
      </div>

      {/* TIPOS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 14,
          marginBottom: 32,
        }}
      >
        {TIPOS.map(t => (
          <button
            key={t.id}
            onClick={() => setTipo(t.id)}
            style={{
              background:
                tipo === t.id
                  ? WINE_LIGHT
                  : '#fff',

              border: `2px solid ${
                tipo === t.id
                  ? WINE
                  : '#EDE0DB'
              }`,

              borderRadius: 18,

              padding: '24px',

              textAlign: 'left',
              cursor: 'pointer',

              transition: 'all 0.15s',
            }}
          >
            <div
              style={{
                fontSize: 34,
                marginBottom: 12,
              }}
            >
              {t.icon}
            </div>

            <div
              style={{
                fontSize: 16,
                fontWeight: 700,

                color:
                  tipo === t.id
                    ? WINE
                    : '#1A0A06',
              }}
            >
              {t.label}
            </div>

            <div
              style={{
                fontSize: 12,
                color: '#A0786A',
                marginTop: 4,
              }}
            >
              {t.desc}
            </div>
          </button>
        ))}
      </div>

      {/* SALON */}
      {tipo === 'Salon' && (
        <div>

          {/* TABS */}
          <div
            style={{
              display: 'flex',
              gap: 6,
              marginBottom: 18,
              borderBottom: '1px solid #EDE0DB',
            }}
          >
            {salones.map(s => (
              <button
                key={s.id}
                onClick={() => {
                  posiciones.current = {}
                  setSalonActivo(s.id)
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',

                  padding: '9px 18px',

                  fontSize: 14,

                  fontWeight:
                    salonActivo === s.id
                      ? 700
                      : 500,

                  color:
                    salonActivo === s.id
                      ? WINE
                      : '#A0786A',

                  borderBottom:
                    salonActivo === s.id
                      ? `2px solid ${WINE}`
                      : '2px solid transparent',

                  marginBottom: -1,
                }}
              >
                {s.nombre}
              </button>
            ))}
          </div>

          <div
            style={{
              fontSize: 13,
              color: '#A0786A',
              marginBottom: 14,
            }}
          >
            Tocá una mesa libre para abrir el pedido
          </div>

          {/* CANVAS */}
          <div
            style={{
              width: '100%',
              height: canvasDisplayH + 2,
              maxWidth: canvasDisplayW,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'relative',

                width: `${canvasW}px`,
                height: `${canvasH}px`,

                transform: `scale(${scale})`,
                transformOrigin: 'top left',

                background: '#fff',

                border: '1px solid #EDE0DB',

                borderRadius: Math.round(
                  16 / scale
                ),

                overflow: 'hidden',

                backgroundImage:
                  'radial-gradient(circle, #EDE0DB 1px, transparent 1px)',

                backgroundSize: '32px 32px',
              }}
            >

              {mesasDelSalon.map((mesa, i) => {

                if (!mesa.activo) return null

                const pos =
                  posiciones.current[mesa.id]
                  || posInicial(i)

                const libre =
                  mesa.estado_id === 1

                const w =
                  parseInt(mesa.ancho)
                  || MESA_W

                const h =
                  parseInt(mesa.alto)
                  || MESA_H

                return (
                  <div
                    key={mesa.id}
                    onClick={() => handleClickMesa(mesa)}
                    style={{
                      position: 'absolute',

                      left: `${pos.x}px`,
                      top: `${pos.y}px`,

                      width: `${w}px`,
                      height: `${h}px`,

                      background:
                        libre
                          ? '#F0FDF4'
                          : WINE_LIGHT,

                      border: `2px solid ${
                        libre
                          ? '#86EFAC'
                          : '#FCA5A5'
                      }`,

                      borderRadius: 16,

                      display: 'flex',
                      flexDirection: 'column',

                      alignItems: 'center',
                      justifyContent: 'center',

                      cursor: 'pointer',

                      transition:
                        'all 0.15s ease',

                      boxShadow: libre
                        ? '0 2px 8px rgba(34,197,94,0.10)'
                        : '0 2px 8px rgba(124,45,18,0.10)',
                    }}

                    onMouseEnter={e => {
                      e.currentTarget.style.transform =
                        'translateY(-2px)'

                      e.currentTarget.style.boxShadow =
                        '0 10px 22px rgba(0,0,0,0.12)'
                    }}

                    onMouseLeave={e => {
                      e.currentTarget.style.transform =
                        'translateY(0px)'

                      e.currentTarget.style.boxShadow =
                        libre
                          ? '0 2px 8px rgba(34,197,94,0.10)'
                          : '0 2px 8px rgba(124,45,18,0.10)'
                    }}
                  >

                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',

                        background:
                          libre
                            ? '#22C55E'
                            : WINE,

                        marginBottom: 7,
                      }}
                    />

                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 600,

                        color:
                          libre
                            ? '#166534'
                            : WINE,

                        opacity: 0.7,
                      }}
                    >
                      Mesa
                    </div>

                    <div
                      style={{
                        fontSize: 24,
                        fontWeight: 800,

                        color:
                          libre
                            ? '#166534'
                            : WINE,

                        lineHeight: 1,
                      }}
                    >
                      {mesa.nro_id}
                    </div>

                    <div
                      style={{
                        fontSize: 10,

                        color:
                          libre
                            ? '#166534'
                            : WINE,

                        opacity: 0.7,

                        marginTop: 4,
                      }}
                    >
                      {mesa.capacidad} pers.
                    </div>

                    {!libre && (
                      <div
                        style={{
                          fontSize: 10,
                          color: WINE,
                          fontWeight: 700,
                          marginTop: 4,
                        }}
                      >
                        Ocupada
                      </div>
                    )}
                  </div>
                )
              })}

              {mesasDelSalon.length === 0 && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,

                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',

                    color: '#C09080',
                    fontSize: 14,
                  }}
                >
                  No hay mesas en este salón
                </div>
              )}

            </div>
          </div>

          {/* LEYENDA */}
          <div
            style={{
              display: 'flex',
              gap: 22,
              marginTop: 14,
            }}
          >
            {[
              {
                label: 'Libre',
                dot: '#22C55E',
              },
              {
                label: 'Ocupada',
                dot: WINE,
              },
            ].map(({ label, dot }) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: dot,
                  }}
                />

                <span
                  style={{
                    fontSize: 12,
                    color: '#A0786A',
                  }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* TAKEAWAY */}
      {tipo === 'Takeaway' && (
        <div
          style={{
            background: '#fff',
            border: '1px solid #EDE0DB',

            borderRadius: 16,

            padding: '24px',

            maxWidth: 420,
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: '#1A0A06',
              marginBottom: 6,
            }}
          >
            Número de pager
          </div>

          <div
            style={{
              fontSize: 12,
              color: '#A0786A',
              marginBottom: 14,
            }}
          >
            Ingresá el número del pager
          </div>

          <input
            type="text"
            placeholder="Ej: 42"
            value={pager}
            onChange={e => setPager(e.target.value)}
            onKeyDown={e =>
              e.key === 'Enter' &&
              handleIrTakeaway()
            }
            style={{
              width: '100%',

              padding: '10px 14px',

              border: '1px solid #EDE0DB',

              borderRadius: 10,

              fontSize: 16,
              fontWeight: 600,

              color: '#1A0A06',

              outline: 'none',

              fontFamily: 'inherit',

              marginBottom: 14,
            }}
            autoFocus
          />

          <button
            onClick={handleIrTakeaway}
            disabled={!pager.trim()}
            style={{
              width: '100%',

              background:
                pager.trim()
                  ? WINE
                  : '#E5D5D0',

              color: '#fff',

              border: 'none',

              borderRadius: 10,

              padding: '11px',

              fontSize: 14,
              fontWeight: 600,

              cursor:
                pager.trim()
                  ? 'pointer'
                  : 'default',
            }}
          >
            Abrir carta →
          </button>
        </div>
      )}

      {/* DELIVERY */}
      {tipo === 'Delivery' && (
        <div
          style={{
            background: '#fff',
            border: '1px solid #EDE0DB',

            borderRadius: 16,

            padding: '24px',

            maxWidth: 420,
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: '#1A0A06',
              marginBottom: 6,
            }}
          >
            Datos del cliente
          </div>

          <div
            style={{
              fontSize: 12,
              color: '#A0786A',
              marginBottom: 16,
            }}
          >
            Los campos son opcionales
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              marginBottom: 16,
            }}
          >

            <input
              type="text"
              placeholder="Nombre del cliente"
              value={nombreCliente}
              onChange={e =>
                setNombreCliente(e.target.value)
              }
              style={{
                width: '100%',
                padding: '9px 14px',

                border: '1px solid #EDE0DB',

                borderRadius: 10,

                fontSize: 13,

                outline: 'none',

                fontFamily: 'inherit',

                color: '#1A0A06',

                boxSizing: 'border-box',
              }}
              autoFocus
            />

            <input
              type="tel"
              placeholder="Teléfono"
              value={telefonoCliente}
              onChange={e =>
                setTelefonoCliente(e.target.value)
              }
              style={{
                width: '100%',
                padding: '9px 14px',

                border: '1px solid #EDE0DB',

                borderRadius: 10,

                fontSize: 13,

                outline: 'none',

                fontFamily: 'inherit',

                color: '#1A0A06',

                boxSizing: 'border-box',
              }}
            />

            <input
              type="text"
              placeholder="Dirección"
              value={direccionCliente}
              onChange={e =>
                setDireccionCliente(e.target.value)
              }
              onKeyDown={e =>
                e.key === 'Enter' &&
                handleIrDelivery()
              }
              style={{
                width: '100%',
                padding: '9px 14px',

                border: '1px solid #EDE0DB',

                borderRadius: 10,

                fontSize: 13,

                outline: 'none',

                fontFamily: 'inherit',

                color: '#1A0A06',

                boxSizing: 'border-box',
              }}
            />

          </div>

          <button
            onClick={handleIrDelivery}
            style={{
              width: '100%',

              background: WINE,

              color: '#fff',

              border: 'none',

              borderRadius: 10,

              padding: '11px',

              fontSize: 14,

              fontWeight: 600,

              cursor: 'pointer',
            }}
          >
            Abrir carta →
          </button>
        </div>
      )}

      {modalPedido && (
        <ModalPedido
          pedido={modalPedido}
          onClose={() => {
            setModalPedido(null)
            cargarMesas(salonActivo)
          }}
          onRefresh={() =>
            cargarMesas(salonActivo)
          }
        />
      )}

    </div>
  )
}