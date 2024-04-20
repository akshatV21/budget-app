export const AUTH_OPTIONS_KEY = 'auth-options'

export const EVENTS = {
  TRANSACTION_CREATED: 'transaction-created',
} as const

export const TTL = 60000

export const ENTITIES = ['account', 'profile'] as const

export const LIMITS = {
  WEEKS: 12,
  MONTHS: 24,
  YEARS: 4,
} as const
