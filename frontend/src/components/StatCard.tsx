interface Props {
  title: string
  value: number | string
  icon: string
}

export function StatCard({ title, value, icon }: Props) {
  return (
    <div className="bg-bg-card border border-border rounded-[--radius-card] p-5 flex items-center gap-4">
      <span className="text-2xl w-12 h-12 flex items-center justify-center bg-accent-soft rounded-sm">
        {icon}
      </span>
      <div className="flex flex-col">
        <span className="text-2xl font-bold leading-tight">{value}</span>
        <span className="text-xs text-text-secondary">{title}</span>
      </div>
    </div>
  )
}
