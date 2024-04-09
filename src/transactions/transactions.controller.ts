import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { TransactionsService } from './transactions.service'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { AuthUser, HttpResponse } from 'src/utils/types'
import { CreateTransactionDto } from './dtos/create-transaction.dto'
import { User } from 'src/auth/decorators/user.decorator'

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('create')
  @Auth()
  async httpCreateTransaction(@Body() data: CreateTransactionDto, @User() user: AuthUser): HttpResponse {
    const transaction = await this.transactionsService.create(data, user)
    return { success: true, message: 'Transaction created successfully.', data: { transaction } }
  }

  @Get(':transactionId')
  @Auth()
  async httpGetTransaction(@Param('transactionId') id: string, @User() user: AuthUser): HttpResponse {
    const transaction = await this.transactionsService.getById(id, user)
    return { success: true, message: 'Fetched transaction successfully.', data: { transaction } }
  }
}
