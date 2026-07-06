import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'

const links = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/customers', label: 'Clientes', icon: '👤' },
  { to: '/items', label: 'Itens', icon: '📦' },
  { to: '/transport-types', label: 'Transportes', icon: '🚚' },
  { to: '/orders', label: 'Pedidos', icon: '🧾' },
  { to: '/audit-logs', label: 'Auditoria', icon: '📋' },
]

export function Sidebar() {
  const { username, logout } = useAuth()

  return (
    <aside className="sticky top-0 h-screen w-60 bg-bg-secondary border-r border-border p-8 flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <span className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center font-bold text-xs text-white">
          OV
        </span>
        <span className="text-base font-semibold text-text-primary">OrderHub</span>
      </div>
      <nav className="flex flex-col gap-1 flex-1">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 py-2.5 rounded-sm text-sm text-text-secondary no-underline transition-colors hover:bg-bg-hover hover:text-text-primary ${
                isActive ? 'bg-accent-soft text-accent font-medium' : ''
              }`
            }
          >
            <span className="text-lg w-6 text-center">{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="pt-4 border-t border-border flex items-center justify-between">
        <span className="text-sm text-text-muted truncate">{username}</span>
        <button onClick={logout} className="text-sm text-text-secondary hover:text-red transition-colors cursor-pointer bg-transparent border-none">
          Sair
        </button>
      </div>
    </aside>
  )
}
