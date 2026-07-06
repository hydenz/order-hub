import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api/client'
import type { Customer } from '../types'
import { formatBRL } from '../utils/format'

const statusColors: Record<string, string> = {
  Draft: 'badge badge-draft',
  Confirmed: 'badge badge-confirmed',
  Shipped: 'badge badge-shipped',
  Delivered: 'badge badge-delivered',
  Cancelled: 'badge badge-cancelled',
}

export function CustomerDetail() {
  const { id } = useParams<{ id: string }>()

  const { data: customer, isLoading } = useQuery<Customer>({
    queryKey: ['customer', id],
    queryFn: () => api.get(`/customers/${id}`).then(r => r.data),
  })

  if (isLoading) return <div className="flex items-center justify-center py-12 text-text-muted">Carregando...</div>
  if (!customer) return <div className="flex items-center justify-center py-12 text-text-muted">Cliente não encontrado</div>

  return (
    <div className="page">
      <Link to="/customers" className="flex items-center gap-1 text-sm text-text-secondary hover:text-accent transition-colors no-underline w-fit">
        ← Voltar para Clientes
      </Link>

      <div>
        <h1 className="text-2xl font-semibold text-text-primary">{customer.name}</h1>
        <p className="text-sm text-text-muted mt-1">Detalhes do cliente</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-5">
        <div className="card">
          <h2 className="text-base font-semibold text-text-primary mb-4">Informações</h2>
          <div className="detail-row"><span>Email</span><span>{customer.email || '—'}</span></div>
          <div className="detail-row"><span>Telefone</span><span>{customer.phone || '—'}</span></div>
          <div className="detail-row"><span>Documento</span><span>{customer.document || '—'}</span></div>
          <div className="detail-row"><span>Cadastro</span><span>{new Date(customer.createdAt).toLocaleDateString()}</span></div>
        </div>

        <div className="card">
          <h2 className="text-base font-semibold text-text-primary mb-4">Pedidos ({customer.orders?.length || 0})</h2>
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Status</th>
                <th>Total</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {customer.orders?.map(order => (
                <tr key={order.id}>
                  <td><Link to={`/orders/${order.id}`} className="text-accent font-medium no-underline hover:underline">#{order.id}</Link></td>
                  <td><span className={statusColors[order.status]}>{order.status}</span></td>
                  <td className="font-medium">{formatBRL(order.totalAmount)}</td>
                  <td className="text-text-secondary">{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {(!customer.orders || customer.orders.length === 0) && (
                <tr><td colSpan={4} className="text-center text-text-muted py-10">Nenhum pedido</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
