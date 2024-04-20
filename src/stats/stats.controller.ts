import { Controller, Get, Query } from '@nestjs/common'
import { StatsService } from './stats.service'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { ListStatsDto } from './dtos/list-stats.dto'
import { AuthUser, HttpResponse } from 'src/utils/types'
import { User } from 'src/auth/decorators/user.decorator'

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('list')
  @Auth()
  async httpListStats(@Query() query: ListStatsDto, @User() user: AuthUser): HttpResponse {
    const stats = await this.statsService.list(query, user)
    return { success: true, message: 'Fetched stats successfully.', data: { stats } }
  }
}
