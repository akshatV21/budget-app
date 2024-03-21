import { Body, Controller, Post } from '@nestjs/common'
import { AccountsService } from './accounts.service'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { AuthUser, HttpResponse } from 'src/utils/types'
import { CreateAccountDto } from './dtos/create-account.dto'
import { User } from 'src/auth/decorators/user.decorator'

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post('create')
  @Auth()
  async httpCreateAccount(@Body() data: CreateAccountDto, @User() user: AuthUser): HttpResponse {
    const account = await this.accountsService.create(data, user)
    return { success: true, message: 'Account created successfully', data: { account } }
  }
}
