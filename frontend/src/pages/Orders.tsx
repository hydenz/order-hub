import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'
import type { Order, OrderStatus, Customer } from '../types'
import { Link, useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import { Modal } from '../components/Modal'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { formatBRL } from '../utils/format'

type OrderForm = { customerId: string }

const statusColors: Record<string, string> = {
  Draft: 'badge badge-draft',
  Confirmed: 'badge badge-confirmed',
  Shipped: 'badge badge-shipped',
  Delivered: 'badge badge-delivered',
  Cancelled: 'badge badge-cancelled',
}

const statuses: OrderStatus[] = ['Draft', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled']

export function Orders() {
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const statusFilter = searchParams.get('status') || ''
  const [modalOpen, setModalOpen] = useState(false)

  const { register, handleSubmit: withForm, reset } = useForm<OrderForm>()

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ['orders', statusFilter],
    queryFn: () => api.get('/orders', { params: statusFilter ? { status: statusFilter } : {} }).then(r => r.data),
  })

  const { data: customers } = useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: () => api.get('/customers').then(r => r.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: { customerId: number }) => api.post('/orders', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      setModalOpen(false)
      reset()
    },
  })

  function handleFilter(status: string) {
    if (status === statusFilter) setSearchParams({})
    else setSearchParams(status ? { status } : {})
  }

  function onSubmit(data: OrderForm) {
    createMutation.mutate({ customerId: Number(data.customerId) })
  }

  if (isLoading) return <div className="flex items-center justify-center py-12 text-text-muted">Carregando...</div>

  return (
    <div className="page">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-semibold">Ordens de Venda</h1>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>+ Nova OV</button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          className={`filter-btn ${!statusFilter ? 'active' : ''}`}
          onClick={() => setSearchParams({})}
        >
          Todos
        </button>
        {statuses.map(s => (
          <button
            key={s}
            className={`filter-btn ${statusFilter === s ? 'active' : ''}`}
            onClick={() => handleFilter(s)}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="bg-bg-card border border-border rounded-[--radius-card] p-6">
        <table className="table w-full">
          <thead>
            <tr>
              <th>#</th>
              <th>Cliente</th>
              <th>Status</th>
              <th>Itens</th>
              <th>Total</th>
              <th>Data</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {orders?.map(order => (
              <tr key={order.id}>
                <td><Link to={`/orders/${order.id}`} className="text-accent font-medium no-underline hover:underline">#{order.id}</Link></td>
                <td>{order.customer.name}</td>
                <td><span className={statusColors[order.status]}>{order.status}</span></td>
                <td>{order.items.length}</td>
                <td>{formatBRL(order.totalAmount)}</td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td><Link to={`/orders/${order.id}`} className="btn btn-sm">Detalhes</Link></td>
              </tr>
            ))}
            {orders?.length === 0 && (
              <tr><td colSpan={7} className="text-center text-text-muted py-8">Nenhuma ordem de venda encontrada</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nova Ordem de Venda">
        <form onSubmit={withForm(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-text-secondary font-medium">Cliente</label>
            <select {...register('customerId', { required: true })} className="input">
              <option value="">Selecione um cliente</option>
              {customers?.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" className="btn btn-primary">Criar Pedido</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
