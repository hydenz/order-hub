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
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null)
  const [deleteError, setDeleteError] = useState('')

  const form = useForm<CustomerForm>({ defaultValues: { name: '', email: '', phone: '', document: '' } })
  const { register, handleSubmit: withForm, reset, formState: { errors } } = form

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

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/customers/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['customers'] }); setDeleteTarget(null); setDeleteError('') },
    onError: (err: any) => setDeleteError(err?.response?.data?.message || 'Erro ao excluir cliente'),
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
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Clientes</h1>
          <p className="text-sm text-text-muted mt-1">Gerencie seus clientes</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Novo Cliente</button>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Telefone</th>
              <th>Documento</th>
              <th className="w-28">Ações</th>
            </tr>
          </thead>
          <tbody>
            {customers?.map(c => (
              <tr key={c.id}>
                <td><Link to={`/customers/${c.id}`} className="text-accent font-medium no-underline hover:underline">{c.name}</Link></td>
                <td className="text-text-secondary">{c.email}</td>
                <td className="text-text-secondary">{c.phone}</td>
                <td className="text-text-secondary">{c.document}</td>
                <td>
                  <div className="flex gap-1">
                    <button className="btn btn-sm" onClick={() => openEdit(c)}>Editar</button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => setDeleteTarget(c)}
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {customers?.length === 0 && (
              <tr><td colSpan={5} className="text-center text-text-muted py-10">Nenhum cliente cadastrado</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={!!deleteTarget} onClose={() => { setDeleteTarget(null); setDeleteError('') }} title="Excluir Cliente">
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

      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Editar Cliente' : 'Novo Cliente'}>
        <form onSubmit={withForm(onSubmit)} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-text-secondary font-medium">Nome</label>
            <input {...register('name', { required: 'Nome é obrigatório', minLength: { value: 2, message: 'Mínimo de 2 caracteres' } })} className="input" placeholder="Nome do cliente" />
            {errors.name && <span className="text-xs text-red">{errors.name.message}</span>}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-text-secondary font-medium">Email</label>
            <input {...register('email', { pattern: { value: /^$|^\S+@\S+\.\S+$/, message: 'Email inválido' } })} className="input" type="email" placeholder="email@exemplo.com" />
            {errors.email && <span className="text-xs text-red">{errors.email.message}</span>}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-text-secondary font-medium">Telefone</label>
            <input {...register('phone')} className="input" placeholder="(11) 99999-9999" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-text-secondary font-medium">Documento</label>
            <input {...register('document')} className="input" placeholder="CPF ou CNPJ" />
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
