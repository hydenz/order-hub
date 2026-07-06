interface Props {
  title: string
  value: number | string
  icon: string
}

export function StatCard({ title, value, icon }: Props) {
  return (
    <div className="bg-bg-card border border-border rounded-[--radius-card] p-5 flex items-center gap-4 hover:border-accent/30 transition-colors">
      <span className="text-xl w-11 h-11 flex items-center justify-center bg-accent-soft rounded-[--radius-sm] shrink-0">
        {icon}
      </span>
      <div className="flex flex-col min-w-0">
        <span className="text-2xl font-bold leading-tight text-text-primary">{value}</span>
        <span className="text-xs text-text-secondary mt-0.5">{title}</span>
      </div>
    </div>
  )
}
