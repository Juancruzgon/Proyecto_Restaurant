import { useState, useEffect } from 'react'
import { getConfiguracion, actualizarConfiguracion } from '../services/api'

const WINE       = '#7C2D12'
const WINE_LIGHT = '#FEF2EE'

const inputStyle = {
  width: '100%', padding: '9px 12px',
  border: '1px solid #EDE0DB', borderRadius: 9,
  fontSize: 13, outline: 'none',
  fontFamily: 'inherit', color: '#1A0A06', background: '#fff',
  boxSizing: 'border-box',
}

const labelStyle = {
  fontSize: 12, fontWeight: 600,
  color: '#A0786A', marginBottom: 5, display: 'block',
}

function Toggle({ value, onChange, label, sublabel }) {
  return (
    <div onClick={() => onChange(!value)}
      style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', userSelect: 'none' }}>
      <div style={{
        width: 44, height: 24, borderRadius: 12,
        background: value ? WINE : '#D1D5DB',
        position: 'relative', transition: 'background 0.2s', flexShrink: 0,
      }}>
        <div style={{
          position: 'absolute', top: 3, left: value ? 23 : 3,
          width: 18, height: 18, borderRadius: '50%', background: '#fff',
          transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }} />
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: value ? WINE : '#9CA3AF' }}>{label}</div>
        {sublabel && <div style={{ fontSize: 11, color: '#A0786A', marginTop: 1 }}>{sublabel}</div>}
      </div>
    </div>
  )
}

function SectionCard({ title, children }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #EDE0DB', borderRadius: 16, padding: '22px 24px' }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#1A0A06', marginBottom: 16 }}>{title}</div>
      {children}
    </div>
  )
}

export default function Configuracion() {
  const [loading,   setLoading]   = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [guardado,  setGuardado]  = useState(false)

  // Local
  const [nombreLocal,  setNombreLocal]  = useState('Mi Restaurante')
  const [logoUrl,      setLogoUrl]      = useState('')

  // Cocina
  const [mostrarCocina,        setMostrarCocina]        = useState(true)

  // Impresora comanda
  const [imprimirComanda,      setImprimirComanda]      = useState(false)
  const [printerCocinaIp,      setPrinterCocinaIp]      = useState('')
  const [printerCocPuerto,     setPrinterCocPuerto]     = useState('9100')

  // Impresora ticket
  const [imprimirTicket,       setImprimirTicket]       = useState(false)
  const [printerTicketIp,      setPrinterTicketIp]      = useState('')
  const [printerTickPuerto,    setPrinterTickPuerto]    = useState('9100')

  // Cubiertos
  const [cubiertosActivo,      setCubiertosActivo]      = useState(false)
  const [precioCubierto,       setPrecioCubierto]       = useState('0')

  useEffect(() => {
    getConfiguracion().then(data => {
      setNombreLocal(data.nombre_local || 'Mi Restaurante')
      setLogoUrl(data.logo_url || '')
      setMostrarCocina(data.mostrar_cocina ?? true)
      setImprimirComanda(data.imprimir_comanda_cocina ?? false)
      setPrinterCocinaIp(data.printer_cocina_ip || '')
      setPrinterCocPuerto(String(data.printer_cocina_puerto ?? 9100))
      setImprimirTicket(data.imprimir_ticket_cliente ?? false)
      setPrinterTicketIp(data.printer_ticket_ip || '')
      setPrinterTickPuerto(String(data.printer_ticket_puerto ?? 9100))
      setCubiertosActivo(data.cubiertos_activo ?? false)
      setPrecioCubierto(String(data.precio_cubierto ?? 0))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const handleGuardar = async () => {
    setGuardando(true)
    try {
      await actualizarConfiguracion({
        nombre_local:            nombreLocal.trim() || 'Mi Restaurante',
        logo_url:                logoUrl.trim() || null,
        mostrar_cocina:          mostrarCocina,
        imprimir_comanda_cocina: imprimirComanda,
        printer_cocina_ip:       printerCocinaIp.trim() || null,
        printer_cocina_puerto:   parseInt(printerCocPuerto) || 9100,
        imprimir_ticket_cliente: imprimirTicket,
        printer_ticket_ip:       printerTicketIp.trim() || null,
        printer_ticket_puerto:   parseInt(printerTickPuerto) || 9100,
        cubiertos_activo:        cubiertosActivo,
        precio_cubierto:         parseFloat(precioCubierto) || 0,
      })
      setGuardado(true)
      setTimeout(() => setGuardado(false), 2500)
    } catch (e) {
      alert('Error al guardar configuración')
    } finally {
      setGuardando(false)
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#A0786A', fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}>
      Cargando...
    </div>
  )

  return (
    <div style={{ padding: '28px 32px', fontFamily: "'DM Sans', sans-serif", maxWidth: 640 }}>

      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#1A0A06', letterSpacing: '-0.4px' }}>⚙️ Configuración</div>
        <div style={{ fontSize: 13, color: '#A0786A', marginTop: 2 }}>Ajustes generales del sistema</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Datos del local */}
        <SectionCard title="🏠 Datos del local">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={labelStyle}>Nombre del local</label>
              <input value={nombreLocal} onChange={e => setNombreLocal(e.target.value)} style={inputStyle} placeholder="Mi Restaurante" />
            </div>
            <div>
              <label style={labelStyle}>URL del logo</label>
              <input value={logoUrl} onChange={e => setLogoUrl(e.target.value)} style={inputStyle} placeholder="https://..." />
              {logoUrl && (
                <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <img src={logoUrl} alt="logo" style={{ width: 60, height: 60, borderRadius: 12, objectFit: 'cover', border: '1px solid #EDE0DB' }}
                    onError={e => { e.target.style.display = 'none' }} />
                  <span style={{ fontSize: 11, color: '#A0786A' }}>Vista previa</span>
                </div>
              )}
            </div>
          </div>
        </SectionCard>

        {/* Pantalla cocina */}
        <SectionCard title="👨‍🍳 Pantalla de cocina">
          <Toggle
            value={mostrarCocina}
            onChange={setMostrarCocina}
            label={mostrarCocina ? 'Visible en el menú' : 'Oculta del menú'}
            sublabel="Muestra u oculta el acceso a la pantalla de cocina en el menú lateral"
          />
        </SectionCard>

        {/* Impresora cocina */}
        <SectionCard title="🖨 Impresora de cocina (comanda)">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Toggle
              value={imprimirComanda}
              onChange={setImprimirComanda}
              label={imprimirComanda ? 'Impresión de comanda activada' : 'Impresión de comanda desactivada'}
              sublabel="Envía la comanda a la impresora de cocina al crear o actualizar el pedido"
            />
            {imprimirComanda && (
              <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>IP de la impresora</label>
                  <input value={printerCocinaIp} onChange={e => setPrinterCocinaIp(e.target.value)}
                    style={inputStyle} placeholder="192.168.1.100" />
                </div>
                <div style={{ width: 100 }}>
                  <label style={labelStyle}>Puerto</label>
                  <input type="number" value={printerCocPuerto} onChange={e => setPrinterCocPuerto(e.target.value)}
                    style={inputStyle} placeholder="9100" />
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Impresora ticket */}
        <SectionCard title="🧾 Impresora de ticket (cliente)">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Toggle
              value={imprimirTicket}
              onChange={setImprimirTicket}
              label={imprimirTicket ? 'Impresión de ticket activada' : 'Impresión de ticket desactivada'}
              sublabel="Envía el ticket al cliente al cobrar el pedido"
            />
            {imprimirTicket && (
              <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>IP de la impresora</label>
                  <input value={printerTicketIp} onChange={e => setPrinterTicketIp(e.target.value)}
                    style={inputStyle} placeholder="192.168.1.101" />
                </div>
                <div style={{ width: 100 }}>
                  <label style={labelStyle}>Puerto</label>
                  <input type="number" value={printerTickPuerto} onChange={e => setPrinterTickPuerto(e.target.value)}
                    style={inputStyle} placeholder="9100" />
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Cubiertos */}
        <SectionCard title="🍽 Cubiertos">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Toggle
              value={cubiertosActivo}
              onChange={setCubiertosActivo}
              label={cubiertosActivo ? 'Cubiertos activados' : 'Cubiertos desactivados'}
              sublabel="Se cobra cubierto por persona al crear un pedido de salón"
            />
            {cubiertosActivo && (
              <div style={{ marginTop: 4, maxWidth: 200 }}>
                <label style={labelStyle}>Precio por cubierto ($)</label>
                <input type="number" min="0" step="0.01" value={precioCubierto}
                  onChange={e => setPrecioCubierto(e.target.value)} style={inputStyle} placeholder="0" />
              </div>
            )}
          </div>
        </SectionCard>

        {/* Guardar */}
        <button
          onClick={handleGuardar}
          disabled={guardando}
          style={{
            background: guardado ? '#16A34A' : WINE,
            color: '#fff', border: 'none', borderRadius: 12,
            padding: '12px 28px', fontSize: 14, fontWeight: 600,
            cursor: guardando ? 'default' : 'pointer',
            opacity: guardando ? 0.8 : 1,
            transition: 'background 0.3s',
            alignSelf: 'flex-start',
          }}
        >
          {guardando ? 'Guardando...' : guardado ? '✓ Guardado' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  )
}
