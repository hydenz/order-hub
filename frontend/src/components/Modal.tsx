import type { ReactNode } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export function Modal({ open, onClose, title, children }: Props) {
  if (!open) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="bg-bg-card border border-border rounded-[--radius-card] p-6 w-[90%] max-w-[480px] max-h-[85vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
          <button
            className="bg-transparent border-none text-text-secondary cursor-pointer text-base p-1.5 rounded-[--radius-sm] hover:text-text-primary hover:bg-bg-hover transition-colors"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
