import { NavLink, useNavigate } from 'react-router-dom'

const WINE = '#7C2D12'
const WINE_LIGHT = '#FEF2EE'
const WINE_MID = '#F3D5CC'

const navItems = [
  { to: '/dashboard', icon: '▣', label: 'Dashboard' },
  { to: '/mesas', icon: '⊞', label: 'Mesas' },
  { to: '/pedidos', icon: '📋', label: 'Pedidos' },
  { to: '/productos', icon: '🛒', label: 'Productos', adminOnly: true },
  { to: '/insumos', icon: '📦', label: 'Insumos', adminOnly: true },
  { to: '/gastos', icon: '💰', label: 'Gastos', adminOnly: true },
  { to: '/usuarios', icon: '👥', label: 'Usuarios', adminOnly: true },
  { to: '/cocina', icon: '👨‍🍳', label: 'Cocina', adminOnly: true },
]

export default function Layout({ children }) {
  const navigate = useNavigate()
  const rolId = localStorage.getItem('rol_id')
  const nombre = localStorage.getItem('nombre')
  const inicial = nombre ? nombre.charAt(0).toUpperCase() : '?'

  const cerrarSesion = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('rol_id')
    localStorage.removeItem('nombre')
    localStorage.removeItem('usuario_id')
    navigate('/')
  }

  const visible = navItems.filter(i => !i.adminOnly || rolId === '1')

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8F5F4', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Sidebar */}
      <aside style={{
        width: 220,
        minWidth: 220,
        background: '#fff',
        borderRight: '1px solid #EDE0DB',
        display: 'flex',
        flexDirection: 'column',
        padding: '0',
        position: 'sticky',
        top: 0,
        height: '100vh',
      }}>
        {/* Logo */}
        <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid #EDE0DB' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: WINE,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18,
            }}>🍕</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#1A0A06', letterSpacing: '-0.3px' }}>Pizzería</div>
              <div style={{ fontSize: 11, color: '#A0786A', marginTop: 1 }}>Panel de gestión</div>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: '#C09080', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0 8px', marginBottom: 8 }}>
            Navegación
          </div>
          {visible.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 12px',
                borderRadius: 10,
                marginBottom: 2,
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? WINE : '#5C3A2E',
                background: isActive ? WINE_LIGHT : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.15s',
              })}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User profile footer */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid #EDE0DB',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: WINE_MID,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700, color: WINE,
            flexShrink: 0,
          }}>{inicial}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1A0A06', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nombre}</div>
            <div style={{ fontSize: 11, color: '#A0786A' }}>{rolId === '1' ? 'Admin' : 'Empleado'}</div>
          </div>
          <button
            onClick={cerrarSesion}
            title="Cerrar sesión"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#C09080', fontSize: 18, padding: 2,
              borderRadius: 6, lineHeight: 1,
            }}
          >⏻</button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>
    </div>
  )
}
