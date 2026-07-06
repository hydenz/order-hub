import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'
import type { Order, OrderStatus, Customer, TransportType } from '../types'
import { Link, useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import { Modal } from '../components/Modal'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { formatBRL, formatStatus } from '../utils/format'

type OrderForm = { customerId: string; transportTypeId: string }

const statusColors: Record<string, string> = {
  Criada: 'badge badge-draft',
  Planejada: 'badge badge-confirmed',
  Agendada: 'badge badge-shipped',
  EmTransporte: 'badge badge-shipped',
  Entregue: 'badge badge-delivered',
}

const statuses: OrderStatus[] = ['Criada', 'Planejada', 'Agendada', 'EmTransporte', 'Entregue']

export function Orders() {
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const statusFilter = searchParams.get('status') || ''
  const [modalOpen, setModalOpen] = useState(false)

  const { register, handleSubmit: withForm, reset, formState: { errors }, watch } = useForm<OrderForm>()

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ['orders', statusFilter],
    queryFn: () => api.get('/orders', { params: statusFilter ? { status: statusFilter } : {} }).then(r => r.data),
  })

  const { data: customers } = useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: () => api.get('/customers').then(r => r.data),
  })

  const selectedCustomerId = watch('customerId')

  const { data: customerTransports } = useQuery<TransportType[]>({
    queryKey: ['customer-transports', selectedCustomerId],
    queryFn: () => api.get(`/customers/${selectedCustomerId}/transport-types`).then(r => r.data),
    enabled: !!selectedCustomerId,
  })

  const createMutation = useMutation({
    mutationFn: (data: { customerId: number; transportTypeId: number }) => api.post('/orders', data),
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
    createMutation.mutate({
      customerId: Number(data.customerId),
      transportTypeId: Number(data.transportTypeId),
    })
  }

  if (isLoading) return <div className="flex items-center justify-center py-12 text-text-muted">Carregando...</div>

  return (
    <div className="page">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Ordens de Venda</h1>
          <p className="text-sm text-text-muted mt-1">Gerencie os pedidos dos clientes</p>
        </div>
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
            {formatStatus(s)}
          </button>
        ))}
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Cliente</th>
              <th>Transporte</th>
              <th>Status</th>
              <th>Itens</th>
              <th>Total</th>
              <th>Data</th>
              <th className="w-24">Ações</th>
            </tr>
          </thead>
          <tbody>
            {orders?.map(order => (
              <tr key={order.id}>
                <td><Link to={`/orders/${order.id}`} className="text-accent font-medium no-underline hover:underline">#{order.id}</Link></td>
                <td>{order.customer.name}</td>
                <td className="text-text-secondary">{order.transportType?.name}</td>
                <td><span className={statusColors[order.status]}>{formatStatus(order.status)}</span></td>
                <td className="text-text-secondary">{order.items.length}</td>
                <td className="font-medium">{formatBRL(order.totalAmount)}</td>
                <td className="text-text-secondary">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td><Link to={`/orders/${order.id}`} className="btn btn-sm">Detalhes</Link></td>
              </tr>
            ))}
            {orders?.length === 0 && (
              <tr><td colSpan={8} className="text-center text-text-muted py-10">Nenhuma ordem de venda encontrada</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); reset() }} title="Nova Ordem de Venda">
        <form onSubmit={withForm(onSubmit)} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-text-secondary font-medium">Cliente</label>
            <select {...register('customerId', { required: 'Selecione um cliente' })} className="input">
              <option value="">Selecione um cliente</option>
              {customers?.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.customerId && <span className="text-xs text-red">{errors.customerId.message}</span>}
          </div>

          {selectedCustomerId && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-text-secondary font-medium">Tipo de Transporte</label>
              <select {...register('transportTypeId', { required: 'Selecione o transporte' })} className="input">
                <option value="">Selecione o transporte</option>
                {customerTransports?.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              {errors.transportTypeId && <span className="text-xs text-red">{errors.transportTypeId.message}</span>}
              {customerTransports?.length === 0 && (
                <span className="text-xs text-red">Cliente não possui tipos de transporte autorizados</span>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" className="btn" onClick={() => { setModalOpen(false); reset() }}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={!selectedCustomerId}>Criar Pedido</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
