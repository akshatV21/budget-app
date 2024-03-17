import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { DatabaseService } from 'src/database/database.service'
import { AuthDto } from './dtos/auth.dto'
import { hashSync, compareSync } from 'bcrypt'
import { sign } from 'jsonwebtoken'

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly configService: ConfigService,
  ) {}

  async register(authDto: AuthDto) {
    const userExists = await this.db.user.findUnique({
      where: { username: authDto.username },
      select: { id: true },
    })

    if (userExists) {
      throw new BadRequestException('Porvided username is already in user.')
    }

    const user = await this.db.user.create({
      data: {
        username: authDto.username,
        password: hashSync(authDto.password, 8),
      },
      select: { id: true, username: true, avatar: true },
    })

    return user
  }

  async login(authDto: AuthDto) {
    const registeredUser = await this.db.user.findUnique({
      where: { username: authDto.username },
      select: { id: true, username: true, password: true, avatar: true },
    })

    if (!registeredUser) {
      throw new BadRequestException('No user exists with provided username.')
    }

    const passwordMatches = compareSync(authDto.password, registeredUser.password)

    if (!passwordMatches) {
      throw new BadRequestException('Invalid password provided.')
    }

    const { password, ...user } = registeredUser
    const token = this.generateToken(registeredUser.id, '24h')

    return { user, token }
  }

  private generateToken(id: string, expiresIn: string): string {
    const secret = this.configService.getOrThrow('JWT_SECRET')
    return sign({ id }, secret, { expiresIn })
  }
}
