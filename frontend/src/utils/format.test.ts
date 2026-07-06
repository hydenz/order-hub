import { describe, it, expect } from 'vitest'
import { formatBRL } from './format'

describe('formatBRL', () => {
  it('formats integer values', () => {
    expect(formatBRL(1000)).toBe('R$ 1.000,00')
  })

  it('formats decimal values', () => {
    expect(formatBRL(1234.56)).toBe('R$ 1.234,56')
  })

  it('formats zero', () => {
    expect(formatBRL(0)).toBe('R$ 0,00')
  })

  it('formats small values', () => {
    expect(formatBRL(0.5)).toBe('R$ 0,50')
  })

  it('formats large values', () => {
    expect(formatBRL(1_000_000)).toBe('R$ 1.000.000,00')
  })

  it('rounds to two decimal places', () => {
    expect(formatBRL(10.999)).toBe('R$ 11,00')
  })
})
