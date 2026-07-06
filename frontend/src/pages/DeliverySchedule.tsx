import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api/client'
import type { TransportType, DeliverySchedule as DS } from '../types'
import { useForm } from 'react-hook-form'

type DeliveryForm = { scheduledDate: string; transportTypeId: string }

export function DeliverySchedulePage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()

  const { register, handleSubmit: withForm } = useForm<DeliveryForm>()

  const { data: delivery } = useQuery<DS>({
    queryKey: ['delivery', id],
    queryFn: () => api.get(`/orders/${id}/delivery`).then(r => r.data),
    retry: false,
  })

  const { data: transportTypes } = useQuery<TransportType[]>({
    queryKey: ['transport-types'],
    queryFn: () => api.get('/transporttypes').then(r => r.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: { scheduledDate: string; transportTypeId: number }) =>
      api.post(`/orders/${id}/delivery`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['delivery', id] }); queryClient.invalidateQueries({ queryKey: ['order', id] }) },
  })

  const updateMutation = useMutation({
    mutationFn: (data: { scheduledDate: string; transportTypeId: number; status: string }) =>
      api.put(`/orders/${id}/delivery`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['delivery', id] }); queryClient.invalidateQueries({ queryKey: ['order', id] }) },
  })

  const statusMutation = useMutation({
    mutationFn: (status: string) =>
      api.put(`/orders/${id}/delivery`, {
        scheduledDate: delivery!.scheduledDate,
        transportTypeId: delivery!.transportTypeId,
        status,
      }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['delivery', id] }); queryClient.invalidateQueries({ queryKey: ['order', id] }) },
  })

  function onSubmit(data: DeliveryForm) {
    const payload = {
      scheduledDate: new Date(data.scheduledDate).toISOString(),
      transportTypeId: Number(data.transportTypeId),
    }

    if (delivery) {
      updateMutation.mutate({ ...payload, status: delivery.status })
    } else {
      createMutation.mutate(payload)
    }
  }

  return (
    <div className="page">
      <Link to={`/orders/${id}`} className="text-accent font-medium no-underline hover:underline text-sm">
        ← Voltar para Pedido #{id}
      </Link>

      <h1 className="text-2xl font-semibold">Agendamento de Entrega</h1>

      <div className="bg-bg-card border border-border rounded-[--radius-card] p-6 max-w-lg">
        <form onSubmit={withForm(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-text-secondary font-medium">Data e Hora</label>
            <input
              type="datetime-local"
              {...register('scheduledDate', { required: true })}
              className="input"
              defaultValue={delivery ? new Date(delivery.scheduledDate).toISOString().slice(0, 16) : ''}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-text-secondary font-medium">Tipo de Transporte</label>
            <select
              {...register('transportTypeId', { required: true })}
              className="input"
              defaultValue={delivery?.transportTypeId || ''}
            >
              <option value="">Selecione</option>
              {transportTypes?.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" className="btn btn-primary">
              {delivery ? 'Atualizar Agendamento' : 'Criar Agendamento'}
            </button>
          </div>
        </form>

        {delivery && (
          <div className="mt-6 pt-4 border-t border-border">
            <h3 className="text-sm font-semibold text-text-secondary mb-3">Status da Entrega</h3>
            <div className="flex gap-2">
              {['Scheduled', 'InTransit', 'Delivered'].map(s => (
                <button
                  key={s}
                  className={`filter-btn ${delivery.status === s ? 'active' : ''}`}
                  onClick={() => statusMutation.mutate(s)}
                >
                  {s === 'Scheduled' ? 'Agendado' : s === 'InTransit' ? 'Em Trânsito' : 'Entregue'}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
