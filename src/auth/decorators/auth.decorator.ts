import { SetMetadata } from '@nestjs/common'
import { AUTH_OPTIONS_KEY } from 'src/utils/constants'
import { AuthOptions } from 'src/utils/types'

export const Auth = (options?: AuthOptions) => {
  const metadata: AuthOptions = {
    isLive: options?.isLive || true,
    isOpen: options?.isOpen || false,
  }

  return SetMetadata(AUTH_OPTIONS_KEY, metadata)
}
