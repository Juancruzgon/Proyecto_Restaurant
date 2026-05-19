// Login.jsx
import { useState } from 'react'
import { login } from '../services/api'
import { useNavigate } from 'react-router-dom'

const WINE = '#7C2D12'

export default function Login() {
  const [username,  setUsername]  = useState('')
  const [password,  setPassword]  = useState('')
  const [error,     setError]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const navigate = useNavigate()

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) return
    setLoading(true)
    setError('')
    try {
      const data = await login(username, password)
      localStorage.setItem('token',      data.access_token)
      localStorage.setItem('rol_id',     data.rol_id)
      localStorage.setItem('nombre',     data.nombre)
      localStorage.setItem('usuario_id', data.usuario_id)
      navigate('/dashboard')
    } catch (e) {
      setError('Usuario o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F8F5F4',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{
        background: '#fff',
        border: '1px solid #EDE0DB',
        borderRadius: 20,
        padding: '40px 36px',
        width: '100%', maxWidth: 380,
        boxShadow: '0 8px 40px rgba(124,45,18,0.08)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: WINE,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, margin: '0 auto 14px',
          }}>🍕</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#1A0A06', letterSpacing: '-0.4px' }}>
            Bienvenido
          </div>
          <div style={{ fontSize: 13, color: '#A0786A', marginTop: 4 }}>
            Ingresá tus credenciales para continuar
          </div>
        </div>

        {/* Formulario */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#A0786A', marginBottom: 6 }}>Usuario</div>
            <input
              autoFocus
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="Ej: juan"
              style={{
                width: '100%', padding: '10px 14px',
                border: '1px solid #EDE0DB', borderRadius: 10,
                fontSize: 14, outline: 'none',
                fontFamily: 'inherit', color: '#1A0A06',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#A0786A', marginBottom: 6 }}>Contraseña</div>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="••••••••"
              style={{
                width: '100%', padding: '10px 14px',
                border: '1px solid #EDE0DB', borderRadius: 10,
                fontSize: 14, outline: 'none',
                fontFamily: 'inherit', color: '#1A0A06',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {error && (
            <div style={{ fontSize: 12, color: '#EF4444', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '8px 12px' }}>
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              background: loading ? '#C09080' : WINE,
              color: '#fff', border: 'none',
              borderRadius: 10, padding: '12px',
              fontSize: 14, fontWeight: 600,
              cursor: loading ? 'default' : 'pointer',
              marginTop: 4,
            }}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </div>
      </div>
    </div>
  )
}