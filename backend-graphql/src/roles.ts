import { GraphQLError } from 'graphql'

export const ROLES = ['admin', 'frontdesk', 'mechanic'] as const
export type Role = typeof ROLES[number]

export function isRole(x: unknown): x is Role {
  return typeof x === 'string' && (ROLES as readonly string[]).includes(x as Role)
}

export function normalizeRole(role: string): Role {
  const r = role.toLowerCase()
  if (!isRole(r)) {
    throw new GraphQLError('Invalid role', { extensions: { code: 'BAD_USER_INPUT' } })
  }
  return r as Role
}
