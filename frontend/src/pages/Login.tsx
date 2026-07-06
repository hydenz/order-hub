import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'
import { useForm } from 'react-hook-form'

type LoginForm = { username: string; password: string }

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>()

  async function onSubmit(data: LoginForm) {
    setServerError('')
    try {
      await login(data)
      navigate('/')
    } catch {
      setServerError('Credenciais inválidas')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary">
      <div className="card w-full max-w-sm">
        <div className="flex flex-col items-center gap-2 mb-8">
          <span className="w-11 h-11 bg-accent rounded-[--radius-sm] flex items-center justify-center font-bold text-sm text-white">
            OV
          </span>
          <span className="text-lg font-semibold text-text-primary mt-1">OrderHub</span>
          <span className="text-xs text-text-muted">Faça login para continuar</span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-text-secondary font-medium">Usuário</label>
            <input
              className="input"
              autoFocus
              placeholder="Digite seu usuário"
              {...register('username', { required: 'Usuário é obrigatório' })}
            />
            {errors.username && (
              <span className="text-xs text-red">{errors.username.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-text-secondary font-medium">Senha</label>
            <input
              type="password"
              className="input"
              placeholder="Digite sua senha"
              {...register('password', { required: 'Senha é obrigatória', minLength: { value: 4, message: 'Mínimo de 4 caracteres' } })}
            />
            {errors.password && (
              <span className="text-xs text-red">{errors.password.message}</span>
            )}
          </div>

          {serverError && (
            <p className="text-sm text-red text-center bg-red-bg rounded-[--radius-sm] py-2 px-3">{serverError}</p>
          )}

          <button type="submit" className="btn btn-primary justify-center w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-xs text-text-muted text-center mt-6 pt-4 border-t border-border">
          Demo: <span className="font-medium text-text-secondary">admin</span> / <span className="font-medium text-text-secondary">admin123</span>
        </p>
      </div>
    </div>
  )
}
