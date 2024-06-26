import { Body, Controller, Post } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthDto } from './dtos/auth.dto'
import { HttpResponse } from 'src/utils/types'
import { Auth } from './decorators/auth.decorator'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Auth({ isOpen: true })
  async httpRegister(@Body() authDto: AuthDto): HttpResponse {
    const user = await this.authService.register(authDto)
    return { success: true, message: 'user registered successfully.', data: { user } }
  }

  @Post('login')
  @Auth({ isOpen: true })
  async httpLogin(@Body() authDto: AuthDto): HttpResponse {
    const payload = await this.authService.login(authDto)
    return { success: true, message: 'User logged in successfully.', data: payload }
  }
}
