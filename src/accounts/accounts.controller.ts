import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common'
import { AccountsService } from './accounts.service'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { AuthUser, HttpResponse } from 'src/utils/types'
import { CreateAccountDto } from './dtos/create-account.dto'
import { User } from 'src/auth/decorators/user.decorator'
import { PaginationDto } from 'src/utils/dtos'
import { UpdateAccountDto } from './dtos/update-account.dto'

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post('create')
  @Auth()
  async httpCreateAccount(@Body() data: CreateAccountDto, @User() user: AuthUser): HttpResponse {
    const account = await this.accountsService.create(data, user)
    return { success: true, message: 'Account created successfully', data: { account } }
  }

  @Get('list')
  @Auth()
  async httpListAccounts(@Query() pagination: PaginationDto, @User() user: AuthUser): HttpResponse {
    const accounts = await this.accountsService.list(pagination, user)
    return { success: true, message: 'Fetched accounts successfully.', data: { accounts } }
  }

  @Get(':accountId')
  @Auth()
  async httpGetAccountById(@Param('accountId') accountId: string, @User() user: AuthUser) {
    const account = await this.accountsService.getById(accountId, user)
    return { success: true, message: 'Fetched account successfully.', data: { account } }
  }

  @Put('update')
  @Auth()
  async httpUpdateAccount(@Body() data: UpdateAccountDto, @User() user: AuthUser): HttpResponse {
    await this.accountsService.update(data, user)
    return { success: true, message: 'Account updated successfully.' }
  }
}
