import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api/client'
import type { Order, Item } from '../types'
import { Modal } from '../components/Modal'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { formatBRL, formatStatus } from '../utils/format'

type AddItemForm = { itemId: string; quantity: number }

const statusColors: Record<string, string> = {
  Criada: 'badge badge-draft',
  Planejada: 'badge badge-confirmed',
  Agendada: 'badge badge-shipped',
  EmTransporte: 'badge badge-shipped',
  Entregue: 'badge badge-delivered',
}

export function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [itemModal, setItemModal] = useState(false)

  const { register, handleSubmit: withForm, reset, formState: { errors } } = useForm<AddItemForm>()

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

  const planMutation = useMutation({
    mutationFn: () => api.put(`/orders/${id}/plan`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['order', id] }); queryClient.invalidateQueries({ queryKey: ['dashboard'] }) },
  })

  const startTransportMutation = useMutation({
    mutationFn: () => api.put(`/orders/${id}/start-transport`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['order', id] }); queryClient.invalidateQueries({ queryKey: ['dashboard'] }) },
  })

  const deliverMutation = useMutation({
    mutationFn: () => api.put(`/orders/${id}/deliver`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['order', id] }); queryClient.invalidateQueries({ queryKey: ['dashboard'] }) },
  })

  const cancelMutation = useMutation({
    mutationFn: () => api.put(`/orders/${id}/cancel`),
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
      <Link to="/orders" className="flex items-center gap-1 text-sm text-text-secondary hover:text-accent transition-colors no-underline w-fit">
        ← Voltar para Pedidos
      </Link>

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Ordem #{order.id}</h1>
          <p className="text-sm text-text-muted mt-1">Detalhes do pedido</p>
        </div>
        <span className={statusColors[order.status]} style={{ fontSize: '0.9rem', padding: '0.35rem 1rem' }}>
          {formatStatus(order.status)}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-5">
        <div className="card">
          <h2 className="text-base font-semibold text-text-primary mb-4">Informações do Pedido</h2>
          <div className="detail-row"><span>Cliente</span><span>{order.customer.name}</span></div>
          <div className="detail-row"><span>Transporte</span><span>{order.transportType?.name || '—'}</span></div>
          <div className="detail-row"><span>Total</span><span>{formatBRL(order.totalAmount)}</span></div>
          <div className="detail-row"><span>Criado em</span><span>{new Date(order.createdAt).toLocaleString()}</span></div>

          <div className="flex gap-2 mt-5 flex-wrap">
            {order.status === 'Criada' && (
              <>
                <button className="btn btn-primary" onClick={() => planMutation.mutate()}>Planejar Pedido</button>
                <button className="btn btn-danger" onClick={() => cancelMutation.mutate()}>Cancelar</button>
              </>
            )}
            {order.status === 'Planejada' && (
              <>
                <Link to={`/orders/${id}/delivery`} className="btn btn-primary">Agendar Entrega</Link>
                <button className="btn btn-danger" onClick={() => cancelMutation.mutate()}>Cancelar</button>
              </>
            )}
            {order.status === 'Agendada' && (
              <button className="btn btn-primary" onClick={() => startTransportMutation.mutate()}>Iniciar Transporte</button>
            )}
            {order.status === 'EmTransporte' && (
              <button className="btn btn-primary" onClick={() => deliverMutation.mutate()}>Confirmar Entrega</button>
            )}
          </div>

          {order.deliverySchedule && (
            <div className="mt-5 pt-4 border-t border-border">
              <h3 className="text-sm font-semibold text-text-secondary mb-3">Entrega</h3>
              <div className="detail-row"><span>Data</span><span>{new Date(order.deliverySchedule.scheduledDate).toLocaleDateString()}</span></div>
              {order.deliverySchedule.serviceWindowStart && (
                <div className="detail-row">
                  <span>Janela</span>
                  <span>{new Date(order.deliverySchedule.serviceWindowStart).toLocaleTimeString()} - {new Date(order.deliverySchedule.serviceWindowEnd!).toLocaleTimeString()}</span>
                </div>
              )}
              <Link to={`/orders/${id}/delivery`} className="btn btn-sm mt-3">Gerenciar Entrega</Link>
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-text-primary">Itens ({order.items.length})</h2>
            {(order.status === 'Criada' || order.status === 'Planejada') && (
              <button className="btn btn-sm" onClick={() => setItemModal(true)}>+ Adicionar</button>
            )}
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qtd</th>
                <th>Preço Unit.</th>
                <th>Subtotal</th>
                {(order.status === 'Criada' || order.status === 'Planejada') && <th className="w-10"></th>}
              </tr>
            </thead>
            <tbody>
              {order.items.map(oi => (
                <tr key={oi.id}>
                  <td className="font-medium">{oi.item.name}</td>
                  <td className="text-text-secondary">{oi.quantity}</td>
                  <td className="text-text-secondary">{formatBRL(oi.unitPrice)}</td>
                  <td className="font-medium">{formatBRL(oi.quantity * oi.unitPrice)}</td>
                  {(order.status === 'Criada' || order.status === 'Planejada') && (
                    <td>
                      <button
                        className="bg-transparent border-none text-text-secondary cursor-pointer text-sm p-1.5 rounded-[--radius-sm] hover:text-red hover:bg-red-bg transition-colors"
                        onClick={() => removeItemMutation.mutate(oi.itemId)}
                      >
                        ✕
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {order.items.length === 0 && (
                <tr><td colSpan={5} className="text-center text-text-muted py-10">Nenhum item adicionado</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={itemModal} onClose={() => { setItemModal(false); reset() }} title="Adicionar Item">
        <form onSubmit={withForm(onSubmit)} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-text-secondary font-medium">Item</label>
            <select {...register('itemId', { required: 'Selecione um item' })} className="input">
              <option value="">Selecione um item</option>
              {availableItems.map(i => (
                <option key={i.id} value={i.id}>{i.name} — {formatBRL(i.price)}</option>
              ))}
            </select>
            {errors.itemId && <span className="text-xs text-red">{errors.itemId.message}</span>}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-text-secondary font-medium">Quantidade</label>
            <input type="number" min="1" defaultValue={1} {...register('quantity', { required: 'Quantidade é obrigatória', min: { value: 1, message: 'Mínimo é 1' }, valueAsNumber: true })} className="input" placeholder="1" />
            {errors.quantity && <span className="text-xs text-red">{errors.quantity.message}</span>}
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" className="btn" onClick={() => { setItemModal(false); reset() }}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Adicionar</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
