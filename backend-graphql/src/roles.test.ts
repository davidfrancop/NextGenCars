import { describe, it, expect } from 'vitest'
import { normalizeRole } from './roles'

describe('normalizeRole', () => {
  it('accepts valid roles ignoring case', () => {
    expect(normalizeRole('ADMIN')).toBe('admin')
    expect(normalizeRole('FrontDesk')).toBe('frontdesk')
  })

  it('throws on invalid role', () => {
    expect(() => normalizeRole('invalid')).toThrow()
  })
})
