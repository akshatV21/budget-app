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
}
