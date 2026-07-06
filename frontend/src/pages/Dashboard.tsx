import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'
import type { DashboardData } from '../types'
import { StatCard } from '../components/StatCard'
import { Link } from 'react-router-dom'
import { formatBRL, formatStatus } from '../utils/format'

const statusColors: Record<string, string> = {
  Criada: 'badge badge-draft',
  Planejada: 'badge badge-confirmed',
  Agendada: 'badge badge-shipped',
  EmTransporte: 'badge badge-shipped',
  Entregue: 'badge badge-delivered',
}

export function Dashboard() {
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/dashboard').then(r => r.data),
  })

  if (isLoading) return <div className="flex items-center justify-center py-12 text-text-muted">Carregando...</div>

  return (
    <div className="page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Dashboard</h1>
          <p className="text-sm text-text-muted mt-1">Visão geral dos pedidos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
        <StatCard title="Ordens Criadas" value={data?.criadas ?? 0} icon="📋" />
        <StatCard title="Ordens Agendadas" value={data?.agendadas ?? 0} icon="📅" />
        <StatCard title="Em Transporte" value={data?.emTransporte ?? 0} icon="🚚" />
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-text-primary">Últimos Pedidos</h2>
          <Link to="/orders" className="btn btn-sm">Ver Todos</Link>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Cliente</th>
              <th>Status</th>
              <th>Total</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            {data?.recentOrders.map(order => (
              <tr key={order.id}>
                <td><Link to={`/orders/${order.id}`} className="text-accent font-medium no-underline hover:underline">#{order.id}</Link></td>
                <td>{order.customerName}</td>
                <td><span className={statusColors[order.status]}>{formatStatus(order.status)}</span></td>
                <td className="font-medium">{formatBRL(order.totalAmount)}</td>
                <td className="text-text-secondary">{new Date(order.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {data?.recentOrders.length === 0 && (
              <tr><td colSpan={5} className="text-center text-text-muted py-10">Nenhum pedido encontrado</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
