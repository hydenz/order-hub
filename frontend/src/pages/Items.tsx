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

  const form = useForm<ItemForm>({ defaultValues: { name: '', description: '', price: 0, stockQuantity: 0 } })
  const { register, handleSubmit: withForm, reset } = form

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
        <h1 className="text-2xl font-semibold">Itens</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Novo Item</button>
      </div>

      <div className="bg-bg-card border border-border rounded-[--radius-card] p-6">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Preço</th>
              <th>Estoque</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {items?.map(item => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{formatBRL(item.price)}</td>
                <td>{item.stockQuantity}</td>
                <td><button className="btn btn-sm" onClick={() => openEdit(item)}>Editar</button></td>
              </tr>
            ))}
            {items?.length === 0 && (
              <tr><td colSpan={4} className="text-center text-text-muted py-8">Nenhum item cadastrado</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Editar Item' : 'Novo Item'}>
        <form onSubmit={withForm(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-text-secondary font-medium">Nome</label>
            <input {...register('name', { required: true })} className="input" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-text-secondary font-medium">Descrição</label>
            <textarea {...register('description')} className="textarea" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-text-secondary font-medium">Preço</label>
              <input type="number" step="0.01" {...register('price', { required: true, valueAsNumber: true })} className="input" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-text-secondary font-medium">Estoque</label>
              <input type="number" {...register('stockQuantity', { required: true, valueAsNumber: true })} className="input" />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" className="btn btn-primary">{editing ? 'Salvar' : 'Criar'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
