import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api/client'
import type { Order, Item } from '../types'
import { Modal } from '../components/Modal'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { formatBRL } from '../utils/format'

type AddItemForm = { itemId: string; quantity: number }

const statusColors: Record<string, string> = {
  Draft: 'badge badge-draft',
  Confirmed: 'badge badge-confirmed',
  Shipped: 'badge badge-shipped',
  Delivered: 'badge badge-delivered',
  Cancelled: 'badge badge-cancelled',
}

export function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [itemModal, setItemModal] = useState(false)

  const { register, handleSubmit: withForm, reset } = useForm<AddItemForm>()

  const { data: order, isLoading } = useQuery<Order>({
    queryKey: ['order', id],
    queryFn: () => api.get(`/orders/${id}`).then(r => r.data),
  })

  const { data: items } = useQuery<Item[]>({
    queryKey: ['items'],
    queryFn: () => api.get('/items').then(r => r.data),
  })

  const addItemMutation = useMutation({
    mutationFn: (data: { itemId: number; quantity: number }) => api.post(`/orders/${id}/items`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] })
      setItemModal(false)
      reset()
    },
  })

  const removeItemMutation = useMutation({
    mutationFn: (itemId: number) => api.delete(`/orders/${id}/items/${itemId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['order', id] }),
  })

  const confirmMutation = useMutation({
    mutationFn: () => api.put(`/orders/${id}/confirm`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['order', id] }); queryClient.invalidateQueries({ queryKey: ['dashboard'] }) },
  })

  const cancelMutation = useMutation({
    mutationFn: () => api.put(`/orders/${id}/cancel`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['order', id] }); queryClient.invalidateQueries({ queryKey: ['dashboard'] }) },
  })

  const shipMutation = useMutation({
    mutationFn: () => api.put(`/orders/${id}/ship`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['order', id] }); queryClient.invalidateQueries({ queryKey: ['dashboard'] }) },
  })

  const deliverMutation = useMutation({
    mutationFn: () => api.put(`/orders/${id}/deliver`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['order', id] }); queryClient.invalidateQueries({ queryKey: ['dashboard'] }) },
  })

  function onSubmit(data: AddItemForm) {
    addItemMutation.mutate({ itemId: Number(data.itemId), quantity: Number(data.quantity) })
  }

  if (isLoading) return <div className="flex items-center justify-center py-12 text-text-muted">Carregando...</div>
  if (!order) return <div className="flex items-center justify-center py-12 text-text-muted">Pedido não encontrado</div>

  const availableItems = items?.filter(i => !order.items.some(oi => oi.itemId === i.id)) || []

  return (
    <div className="page">
      <Link to="/orders" className="text-accent font-medium no-underline hover:underline text-sm">
        ← Voltar para Pedidos
      </Link>

      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-semibold">Ordem #{order.id}</h1>
        <span className={statusColors[order.status]} style={{ fontSize: '1rem', padding: '0.4rem 1rem' }}>
          {order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-5">
        <div className="bg-bg-card border border-border rounded-[--radius-card] p-6">
          <h2 className="text-base font-semibold mb-4">Informações do Pedido</h2>
          <div className="detail-row"><span>Cliente</span><span>{order.customer.name}</span></div>
          <div className="detail-row"><span>Total</span><span>{formatBRL(order.totalAmount)}</span></div>
          <div className="detail-row"><span>Criado em</span><span>{new Date(order.createdAt).toLocaleString()}</span></div>

          <div className="flex gap-2 mt-4 flex-wrap">
            {order.status === 'Draft' && (
              <>
                <button className="btn btn-primary" onClick={() => confirmMutation.mutate()}>Confirmar Pedido</button>
                <button className="btn btn-danger" onClick={() => cancelMutation.mutate()}>Cancelar</button>
              </>
            )}
            {order.status === 'Confirmed' && (
              <>
                <button className="btn btn-primary" onClick={() => shipMutation.mutate()}>Marcar como Enviado</button>
                <button className="btn btn-danger" onClick={() => cancelMutation.mutate()}>Cancelar</button>
              </>
            )}
            {order.status === 'Shipped' && (
              <button className="btn btn-primary" onClick={() => deliverMutation.mutate()}>Marcar como Entregue</button>
            )}
          </div>

          {order.deliverySchedule && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-text-secondary mb-2">Entrega</h3>
              <div className="detail-row"><span>Data</span><span>{new Date(order.deliverySchedule.scheduledDate).toLocaleDateString()}</span></div>
              <div className="detail-row"><span>Transporte</span><span>{order.deliverySchedule.transportType.name}</span></div>
              <div className="detail-row"><span>Status</span><span>{order.deliverySchedule.status}</span></div>
              <Link to={`/orders/${id}/delivery`} className="btn btn-sm mt-2">Gerenciar Entrega</Link>
            </div>
          )}

          {!order.deliverySchedule && (order.status === 'Draft' || order.status === 'Confirmed') && (
            <Link to={`/orders/${id}/delivery`} className="btn btn-sm mt-4">Agendar Entrega</Link>
          )}
        </div>

        <div className="bg-bg-card border border-border rounded-[--radius-card] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold">Itens ({order.items.length})</h2>
            {order.status === 'Draft' && (
              <button className="btn btn-sm" onClick={() => setItemModal(true)}>+ Adicionar</button>
            )}
          </div>
          <table className="table w-full">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qtd</th>
                <th>Preço Unit.</th>
                <th>Subtotal</th>
                {order.status === 'Draft' && <th></th>}
              </tr>
            </thead>
            <tbody>
              {order.items.map(oi => (
                <tr key={oi.id}>
                  <td>{oi.item.name}</td>
                  <td>{oi.quantity}</td>
                  <td>{formatBRL(oi.unitPrice)}</td>
                  <td>{formatBRL(oi.quantity * oi.unitPrice)}</td>
                  {order.status === 'Draft' && (
                    <td>
                      <button
                        className="bg-transparent border-none text-text-secondary cursor-pointer text-sm p-1 rounded hover:text-red hover:bg-red-bg"
                        onClick={() => removeItemMutation.mutate(oi.itemId)}
                      >
                        ✕
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {order.items.length === 0 && (
                <tr><td colSpan={5} className="text-center text-text-muted py-8">Nenhum item adicionado</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={itemModal} onClose={() => { setItemModal(false); reset() }} title="Adicionar Item">
        <form onSubmit={withForm(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-text-secondary font-medium">Item</label>
            <select {...register('itemId', { required: true })} className="input">
              <option value="">Selecione</option>
              {availableItems.map(i => (
                <option key={i.id} value={i.id}>{i.name} — {formatBRL(i.price)}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-text-secondary font-medium">Quantidade</label>
            <input type="number" min="1" defaultValue={1} {...register('quantity', { required: true, valueAsNumber: true })} className="input" />
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" className="btn btn-primary">Adicionar</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
