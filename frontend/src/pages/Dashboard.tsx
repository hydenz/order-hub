import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'
import type { DashboardData } from '../types'
import { StatCard } from '../components/StatCard'
import { Link } from 'react-router-dom'
import { formatBRL } from '../utils/format'

const statusColors: Record<string, string> = {
  Draft: 'badge badge-draft',
  Confirmed: 'badge badge-confirmed',
  Shipped: 'badge badge-shipped',
  Delivered: 'badge badge-delivered',
  Cancelled: 'badge badge-cancelled',
}

export function Dashboard() {
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/dashboard').then(r => r.data),
  })

  if (isLoading) return <div className="flex items-center justify-center py-12 text-text-muted">Carregando...</div>

  return (
    <div className="page">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Pedidos em Aberto" value={data?.openOrders ?? 0} icon="📋" />
        <StatCard title="Pedidos Confirmados" value={data?.confirmedOrders ?? 0} icon="✅" />
        <StatCard title="Entregas Agendadas" value={data?.scheduledDeliveries ?? 0} icon="🚚" />
      </div>

      <div className="bg-bg-card border border-border rounded-[--radius-card] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">Últimos Pedidos</h2>
          <Link to="/orders" className="btn">Ver Todos</Link>
        </div>
        <table className="table w-full">
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
                <td><span className={statusColors[order.status]}>{order.status}</span></td>
                <td>{formatBRL(order.totalAmount)}</td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {data?.recentOrders.length === 0 && (
              <tr><td colSpan={5} className="text-center text-text-muted py-8">Nenhum pedido encontrado</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
