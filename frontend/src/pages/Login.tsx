import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login({ username, password })
      navigate('/')
    } catch {
      setError('Credenciais inválidas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary">
      <div className="bg-bg-card border border-border rounded-[--radius-card] p-8 w-full max-w-sm">
        <div className="flex items-center justify-center gap-3 mb-8">
          <span className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center font-bold text-sm text-white">
            OV
          </span>
          <span className="text-xl font-semibold text-text-primary">OrderHub</span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-text-secondary font-medium">Usuário</label>
            <input
              className="input"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-text-secondary font-medium">Senha</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-sm text-red text-center">{error}</p>
          )}

          <button type="submit" className="btn btn-primary justify-center" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-xs text-text-muted text-center mt-6">
          Demo: <span className="font-medium text-text-secondary">admin</span> / <span className="font-medium text-text-secondary">admin123</span>
        </p>
      </div>
    </div>
  )
}
