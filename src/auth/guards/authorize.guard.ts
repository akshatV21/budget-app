import { CanActivate, ExecutionContext, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Reflector } from '@nestjs/core'
import { verify } from 'jsonwebtoken'
import { DatabaseService } from 'src/database/database.service'
import { AUTH_OPTIONS_KEY } from 'src/utils/constants'
import { AuthOptions } from 'src/utils/types'

@Injectable()
export class Authorize implements CanActivate {
  constructor(
    private readonly db: DatabaseService,
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const options = await this.reflector.get<AuthOptions>(AUTH_OPTIONS_KEY, context.getHandler())

    if (!options.isLive) {
      throw new InternalServerErrorException('This particular endpoint is currently not live.')
    }

    if (options.isOpen) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const authHeader = request.headers['authorization']

    if (!authHeader) {
      throw new UnauthorizedException('No authorization header provided.')
    }

    const [_, token] = authHeader.split(' ')

    if (!token) {
      throw new UnauthorizedException('No token provided.')
    }

    const data = this.validateToken(token, this.configService.getOrThrow('JWT_SECRET'))
    const user = await this.db.user.findUnique({ where: { id: data.id }, select: { id: true, username: true } })

    if (!user) {
      throw new UnauthorizedException('Invalid token provided.')
    }

    request.user = user
    return true
  }

  validateToken(token: string, secret: string): any {
    return verify(token, secret, (err, payload) => {
      // when jwt is valid
      if (!err) return payload

      // when jwt has expired
      if (err.name === 'TokenExpiredError') throw new UnauthorizedException('Token has expired.', 'TokenExpired')

      // throws error when jwt is malformed
      throw new UnauthorizedException('Invalid token provided.', 'InvalidToken')
    })
  }
}
