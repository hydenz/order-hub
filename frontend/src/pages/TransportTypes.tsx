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
  const [deleteTarget, setDeleteTarget] = useState<TransportType | null>(null)
  const [deleteError, setDeleteError] = useState('')

  const form = useForm<TransportForm>({ defaultValues: { name: '', description: '' } })
  const { register, handleSubmit: withForm, reset, formState: { errors } } = form

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

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/transporttypes/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['transport-types'] }); setDeleteTarget(null); setDeleteError('') },
    onError: (err: any) => setDeleteError(err?.response?.data?.message || 'Erro ao excluir tipo'),
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
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Tipos de Transporte</h1>
          <p className="text-sm text-text-muted mt-1">Gerencie as modalidades de transporte</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Novo Tipo</button>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Descrição</th>
              <th className="w-28">Ações</th>
            </tr>
          </thead>
          <tbody>
            {types?.map(t => (
              <tr key={t.id}>
                <td className="font-medium">{t.name}</td>
                <td className="text-text-secondary">{t.description || '—'}</td>
                <td>
                  <div className="flex gap-1">
                    <button className="btn btn-sm" onClick={() => openEdit(t)}>Editar</button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => setDeleteTarget(t)}
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {types?.length === 0 && (
              <tr><td colSpan={3} className="text-center text-text-muted py-10">Nenhum tipo cadastrado</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={!!deleteTarget} onClose={() => { setDeleteTarget(null); setDeleteError('') }} title="Excluir Tipo">
        <p className="text-sm text-text-secondary mb-6">
          Tem certeza que deseja excluir <strong className="text-text-primary">{deleteTarget?.name}</strong>?
          Esta ação não pode ser desfeita.
        </p>
        {deleteError && (
          <p className="text-xs text-red bg-red-bg rounded-[--radius-sm] py-2 px-3 mb-4">{deleteError}</p>
        )}
        <div className="flex justify-end gap-2">
          <button className="btn" onClick={() => { setDeleteTarget(null); setDeleteError('') }}>Cancelar</button>
          <button
            className="btn btn-danger"
            onClick={() => { if (deleteTarget) deleteMutation.mutate(deleteTarget.id) }}
          >
            Excluir
          </button>
        </div>
      </Modal>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Editar Tipo' : 'Novo Tipo'}>
        <form onSubmit={withForm(onSubmit)} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-text-secondary font-medium">Nome</label>
            <input {...register('name', { required: 'Nome é obrigatório', minLength: { value: 2, message: 'Mínimo de 2 caracteres' } })} className="input" placeholder="Nome do tipo" />
            {errors.name && <span className="text-xs text-red">{errors.name.message}</span>}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-text-secondary font-medium">Descrição</label>
            <textarea {...register('description')} className="textarea" placeholder="Descrição opcional" />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" className="btn" onClick={closeModal}>Cancelar</button>
            <button type="submit" className="btn btn-primary">{editing ? 'Salvar' : 'Criar'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
