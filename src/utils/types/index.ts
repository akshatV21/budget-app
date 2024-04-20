import { Interval, TransactionType } from '@prisma/client'

export type HttpResponse = Promise<{
  success: boolean
  message: string
  data?: Record<string, any>
}>

export type AuthOptions = {
  isOpen?: boolean
  isLive?: boolean
}

export type AuthUser = {
  id: string
  username: string
  interval: Interval
}

export type Order = 'asc' | 'desc'

export type Operation = 'debited' | 'credited'

export type Entity = 'account' | 'profile'

export type TransactionCreatedDto = {
  transactionId: string
  type: TransactionType
  amount: number
  accountId: string
  profileId: string
}

export type IntervalDates = {
  weekly: { from: string | Date; to: string | Date }
  monthly: { from: string | Date; to: string | Date }
  yearly: { from: string | Date; to: string | Date }
}
