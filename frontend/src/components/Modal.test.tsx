import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Modal } from './Modal'

describe('Modal', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <Modal open={false} onClose={() => {}} title="Test">
        <p>content</p>
      </Modal>
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders title and children when open', () => {
    render(
      <Modal open={true} onClose={() => {}} title="My Modal">
        <p>Hello world</p>
      </Modal>
    )
    expect(screen.getByText('My Modal')).toBeInTheDocument()
    expect(screen.getByText('Hello world')).toBeInTheDocument()
  })

  it('calls onClose when overlay is clicked', () => {
    const onClose = vi.fn()
    render(
      <Modal open={true} onClose={onClose} title="Test">
        <p>content</p>
      </Modal>
    )
    fireEvent.click(screen.getByText('content').parentElement!.parentElement!)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not call onClose when content is clicked', () => {
    const onClose = vi.fn()
    render(
      <Modal open={true} onClose={onClose} title="Test">
        <p>content</p>
      </Modal>
    )
    fireEvent.click(screen.getByText('content'))
    expect(onClose).not.toHaveBeenCalled()
  })
})
