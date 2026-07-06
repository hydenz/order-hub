import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client'
import type { TransportType } from '../types'
import { Modal } from '../components/Modal'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

type TransportForm = { name: string; description: string }

export function TransportTypes() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<TransportType | null>(null)

  const form = useForm<TransportForm>({ defaultValues: { name: '', description: '' } })
  const { register, handleSubmit: withForm, reset } = form

  const { data: types, isLoading } = useQuery<TransportType[]>({
    queryKey: ['transport-types'],
    queryFn: () => api.get('/transporttypes').then(r => r.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: TransportForm) => api.post('/transporttypes', data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['transport-types'] }); closeModal() },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: TransportForm }) => api.put(`/transporttypes/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['transport-types'] }); closeModal() },
  })

  function openCreate() {
    setEditing(null)
    reset({ name: '', description: '' })
    setModalOpen(true)
  }

  function openEdit(t: TransportType) {
    setEditing(t)
    reset({ name: t.name, description: t.description || '' })
    setModalOpen(true)
  }

  function closeModal() { setModalOpen(false); setEditing(null) }

  function onSubmit(data: TransportForm) {
    if (editing) updateMutation.mutate({ id: editing.id, data })
    else createMutation.mutate(data)
  }

  if (isLoading) return <div className="flex items-center justify-center py-12 text-text-muted">Carregando...</div>

  return (
    <div className="page">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-semibold">Tipos de Transporte</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Novo Tipo</button>
      </div>

      <div className="bg-bg-card border border-border rounded-[--radius-card] p-6">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Descrição</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {types?.map(t => (
              <tr key={t.id}>
                <td>{t.name}</td>
                <td>{t.description || '—'}</td>
                <td><button className="btn btn-sm" onClick={() => openEdit(t)}>Editar</button></td>
              </tr>
            ))}
            {types?.length === 0 && (
              <tr><td colSpan={3} className="text-center text-text-muted py-8">Nenhum tipo cadastrado</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Editar Tipo' : 'Novo Tipo'}>
        <form onSubmit={withForm(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-text-secondary font-medium">Nome</label>
            <input {...register('name', { required: true })} className="input" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-text-secondary font-medium">Descrição</label>
            <textarea {...register('description')} className="textarea" />
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" className="btn btn-primary">{editing ? 'Salvar' : 'Criar'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
