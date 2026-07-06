import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client'
import type { Item } from '../types'
import { Modal } from '../components/Modal'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { formatBRL } from '../utils/format'

type ItemForm = { name: string; description: string; price: number; stockQuantity: number }

export function Items() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Item | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null)
  const [deleteError, setDeleteError] = useState('')

  const form = useForm<ItemForm>({ defaultValues: { name: '', description: '', price: 0, stockQuantity: 0 } })
  const { register, handleSubmit: withForm, reset, formState: { errors } } = form

  const { data: items, isLoading } = useQuery<Item[]>({
    queryKey: ['items'],
    queryFn: () => api.get('/items').then(r => r.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: ItemForm) => api.post('/items', data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['items'] }); closeModal() },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ItemForm }) => api.put(`/items/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['items'] }); closeModal() },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/items/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['items'] }); setDeleteTarget(null); setDeleteError('') },
    onError: (err: any) => setDeleteError(err?.response?.data?.message || 'Erro ao excluir item'),
  })

  function openCreate() {
    setEditing(null)
    reset({ name: '', description: '', price: 0, stockQuantity: 0 })
    setModalOpen(true)
  }

  function openEdit(item: Item) {
    setEditing(item)
    reset({ name: item.name, description: item.description || '', price: item.price, stockQuantity: item.stockQuantity })
    setModalOpen(true)
  }

  function closeModal() { setModalOpen(false); setEditing(null) }

  function onSubmit(data: ItemForm) {
    if (editing) updateMutation.mutate({ id: editing.id, data })
    else createMutation.mutate(data)
  }

  if (isLoading) return <div className="flex items-center justify-center py-12 text-text-muted">Carregando...</div>

  return (
    <div className="page">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Itens</h1>
          <p className="text-sm text-text-muted mt-1">Gerencie os produtos do catálogo</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Novo Item</button>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Preço</th>
              <th>Estoque</th>
              <th className="w-28">Ações</th>
            </tr>
          </thead>
          <tbody>
            {items?.map(item => (
              <tr key={item.id}>
                <td className="font-medium">{item.name}</td>
                <td>{formatBRL(item.price)}</td>
                <td><span className={`font-medium ${item.stockQuantity <= 0 ? 'text-red' : 'text-text-primary'}`}>{item.stockQuantity}</span></td>
                <td>
                  <div className="flex gap-1">
                    <button className="btn btn-sm" onClick={() => openEdit(item)}>Editar</button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => setDeleteTarget(item)}
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {items?.length === 0 && (
              <tr><td colSpan={4} className="text-center text-text-muted py-10">Nenhum item cadastrado</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={!!deleteTarget} onClose={() => { setDeleteTarget(null); setDeleteError('') }} title="Excluir Item">
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

      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Editar Item' : 'Novo Item'}>
        <form onSubmit={withForm(onSubmit)} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-text-secondary font-medium">Nome</label>
            <input {...register('name', { required: 'Nome é obrigatório', minLength: { value: 2, message: 'Mínimo de 2 caracteres' } })} className="input" placeholder="Nome do item" />
            {errors.name && <span className="text-xs text-red">{errors.name.message}</span>}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-text-secondary font-medium">Descrição</label>
            <textarea {...register('description')} className="textarea" placeholder="Descrição opcional" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-text-secondary font-medium">Preço</label>
              <input type="number" step="0.01" {...register('price', { required: 'Preço é obrigatório', min: { value: 0.01, message: 'Preço deve ser maior que zero' }, valueAsNumber: true })} className="input" placeholder="0,00" />
              {errors.price && <span className="text-xs text-red">{errors.price.message}</span>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-text-secondary font-medium">Estoque</label>
              <input type="number" {...register('stockQuantity', { required: 'Estoque é obrigatório', min: { value: 0, message: 'Estoque não pode ser negativo' }, valueAsNumber: true })} className="input" placeholder="0" />
              {errors.stockQuantity && <span className="text-xs text-red">{errors.stockQuantity.message}</span>}
            </div>
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
