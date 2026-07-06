import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatCard } from './StatCard'

describe('StatCard', () => {
  it('renders title and value', () => {
    render(<StatCard title="Open Orders" value={42} icon="📦" />)
    expect(screen.getByText('Open Orders')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('renders string values', () => {
    render(<StatCard title="Revenue" value="R$ 5.000" icon="💰" />)
    expect(screen.getByText('Revenue')).toBeInTheDocument()
    expect(screen.getByText('R$ 5.000')).toBeInTheDocument()
  })

  it('renders icon', () => {
    render(<StatCard title="Test" value={1} icon="🚀" />)
    expect(screen.getByText('🚀')).toBeInTheDocument()
  })
})
