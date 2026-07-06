import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'
import type { AuditLog } from '../types'

export function AuditLogs() {
  const { data, isLoading } = useQuery<{ items: AuditLog[]; total: number }>({
    queryKey: ['audit-logs'],
    queryFn: () => api.get('/auditlogs').then(r => r.data),
  })

  if (isLoading) return <div className="flex items-center justify-center py-12 text-text-muted">Carregando...</div>

  return (
    <div className="page">
      <h1 className="text-2xl font-semibold">Auditoria</h1>

      <div className="bg-bg-card border border-border rounded-[--radius-card] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">Histórico de Alterações ({data?.total || 0})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Data</th>
                <th>Entidade</th>
                <th>ID</th>
                <th>Ação</th>
                <th>Valores Antigos</th>
                <th>Valores Novos</th>
                <th>Usuário</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map(log => (
                <tr key={log.id}>
                  <td className="whitespace-nowrap">{new Date(log.changedAt).toLocaleString()}</td>
                  <td><span className="badge badge-draft">{log.entityType}</span></td>
                  <td>#{log.entityId}</td>
                  <td>{log.action}</td>
                  <td className="json-cell">{log.oldValues || '—'}</td>
                  <td className="json-cell">{log.newValues || '—'}</td>
                  <td>{log.changedBy || '—'}</td>
                </tr>
              ))}
              {data?.items.length === 0 && (
                <tr><td colSpan={7} className="text-center text-text-muted py-8">Nenhum registro de auditoria</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
