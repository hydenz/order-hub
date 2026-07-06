export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatStatus(status: string): string {
  const map: Record<string, string> = {
    Criada: 'Criada',
    Planejada: 'Planejada',
    Agendada: 'Agendada',
    EmTransporte: 'Em Transporte',
    Entregue: 'Entregue',
  }
  return map[status] || status
}
