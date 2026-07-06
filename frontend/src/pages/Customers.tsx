import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../api/client'
import type { Customer } from '../types'
import { Link } from 'react-router-dom'
import { Modal } from '../components/Modal'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

type CustomerForm = { name: string; email: string; phone: string; document: string }

export function Customers() {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Customer | null>(null)

  const form = useForm<CustomerForm>({ defaultValues: { name: '', email: '', phone: '', document: '' } })
  const { register, handleSubmit: withForm, reset } = form

  const { data: customers, isLoading } = useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: () => api.get('/customers').then(r => r.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: CustomerForm) => api.post('/customers', data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['customers'] }); closeModal() },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CustomerForm }) => api.put(`/customers/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['customers'] }); closeModal() },
  })

  function openCreate() {
    setEditing(null)
    reset({ name: '', email: '', phone: '', document: '' })
    setModalOpen(true)
  }

  function openEdit(c: Customer) {
    setEditing(c)
    reset({ name: c.name, email: c.email || '', phone: c.phone || '', document: c.document || '' })
    setModalOpen(true)
  }

  function closeModal() { setModalOpen(false); setEditing(null) }

  function onSubmit(data: CustomerForm) {
    if (editing) updateMutation.mutate({ id: editing.id, data })
    else createMutation.mutate(data)
  }

  if (isLoading) return <div className="flex items-center justify-center py-12 text-text-muted">Carregando...</div>

  return (
    <div className="page">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-semibold">Clientes</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ Novo Cliente</button>
      </div>

      <div className="bg-bg-card border border-border rounded-[--radius-card] p-6">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Telefone</th>
              <th>Documento</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {customers?.map(c => (
              <tr key={c.id}>
                <td><Link to={`/customers/${c.id}`} className="text-accent font-medium no-underline hover:underline">{c.name}</Link></td>
                <td>{c.email}</td>
                <td>{c.phone}</td>
                <td>{c.document}</td>
                <td><button className="btn btn-sm" onClick={() => openEdit(c)}>Editar</button></td>
              </tr>
            ))}
            {customers?.length === 0 && (
              <tr><td colSpan={5} className="text-center text-text-muted py-8">Nenhum cliente cadastrado</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Editar Cliente' : 'Novo Cliente'}>
        <form onSubmit={withForm(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-text-secondary font-medium">Nome</label>
            <input {...register('name', { required: true })} className="input" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-text-secondary font-medium">Email</label>
            <input {...register('email')} className="input" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-text-secondary font-medium">Telefone</label>
            <input {...register('phone')} className="input" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-text-secondary font-medium">Documento</label>
            <input {...register('document')} className="input" />
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" className="btn btn-primary">{editing ? 'Salvar' : 'Criar'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
