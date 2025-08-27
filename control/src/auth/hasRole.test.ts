import { describe, it, expect } from 'vitest'
import { hasRole } from './hasRole'

describe('hasRole', () => {
  it('is case-insensitive', () => {
    expect(hasRole('ADMIN', ['admin'])).toBe(true)
    expect(hasRole('mechanic', ['MECHANIC'])).toBe(true)
  })

  it('returns false for missing role', () => {
    expect(hasRole(undefined, ['admin'])).toBe(false)
    expect(hasRole('guest', ['admin'])).toBe(false)
  })
})
