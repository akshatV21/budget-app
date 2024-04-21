import { Controller, Get, Query } from '@nestjs/common'
import { LoansService } from './loans.service'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { ListLoansDto } from './dtos/list-loans.dto'
import { User } from 'src/auth/decorators/user.decorator'
import { AuthUser, HttpResponse } from 'src/utils/types'

@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Get('list')
  @Auth()
  async httpListLoans(@Query() query: ListLoansDto, @User() user: AuthUser): HttpResponse {
    const loans = await this.loansService.list(query, user)
    return { success: true, message: 'Fetched loans successfully.', data: { loans } }
  }
}
