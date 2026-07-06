import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api/client'
import type { DeliverySchedule as DS } from '../types'
import { useForm } from 'react-hook-form'

type DeliveryForm = {
  scheduledDate: string
  serviceWindowStart: string
  serviceWindowEnd: string
}

export function DeliverySchedulePage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()

  const { register, handleSubmit: withForm, formState: { errors } } = useForm<DeliveryForm>()

  const { data: delivery } = useQuery<DS>({
    queryKey: ['delivery', id],
    queryFn: () => api.get(`/orders/${id}/delivery`).then(r => r.data),
    retry: false,
  })

  const createOrUpdateMutation = useMutation({
    mutationFn: (data: {
      scheduledDate: string
      serviceWindowStart: string | null
      serviceWindowEnd: string | null
    }) => api.post(`/orders/${id}/delivery`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['delivery', id] })
      queryClient.invalidateQueries({ queryKey: ['order', id] })
    },
  })

  function onSubmit(data: DeliveryForm) {
    createOrUpdateMutation.mutate({
      scheduledDate: new Date(data.scheduledDate).toISOString(),
      serviceWindowStart: data.serviceWindowStart
        ? new Date(`${data.scheduledDate.slice(0, 10)}T${data.serviceWindowStart}`).toISOString()
        : null,
      serviceWindowEnd: data.serviceWindowEnd
        ? new Date(`${data.scheduledDate.slice(0, 10)}T${data.serviceWindowEnd}`).toISOString()
        : null,
    })
  }

  return (
    <div className="page">
      <Link to={`/orders/${id}`} className="flex items-center gap-1 text-sm text-text-secondary hover:text-accent transition-colors no-underline w-fit">
        ← Voltar para Pedido #{id}
      </Link>

      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Agendamento de Entrega</h1>
        <p className="text-sm text-text-muted mt-1">Configure a data e janela de atendimento</p>
      </div>

      <div className="card max-w-lg">
        <form onSubmit={withForm(onSubmit)} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-text-secondary font-medium">Data da Entrega</label>
            <input
              type="datetime-local"
              {...register('scheduledDate', { required: 'Data é obrigatória' })}
              className="input"
              defaultValue={delivery ? new Date(delivery.scheduledDate).toISOString().slice(0, 16) : ''}
            />
            {errors.scheduledDate && <span className="text-xs text-red">{errors.scheduledDate.message}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-text-secondary font-medium">Janela de Atendimento (início)</label>
            <input
              type="time"
              {...register('serviceWindowStart')}
              className="input"
              defaultValue={delivery?.serviceWindowStart ? new Date(delivery.serviceWindowStart).toTimeString().slice(0, 5) : ''}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-text-secondary font-medium">Janela de Atendimento (fim)</label>
            <input
              type="time"
              {...register('serviceWindowEnd')}
              className="input"
              defaultValue={delivery?.serviceWindowEnd ? new Date(delivery.serviceWindowEnd).toTimeString().slice(0, 5) : ''}
            />
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" className="btn btn-primary">
              {delivery ? 'Atualizar Agendamento' : 'Criar Agendamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
