import { Body, Controller, Get, Post, Put, Query } from '@nestjs/common'
import { CardsService } from './cards.service'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { CreateCardDto } from './dtos/create-card.dto'
import { User } from 'src/auth/decorators/user.decorator'
import { AuthUser, HttpResponse } from 'src/utils/types'
import { ListCardsDto } from './dtos/list-cards.dto'
import { UpdateCardDto } from './dtos/update-card.dto'

@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Post('create')
  @Auth()
  async httpCreateCard(@Body() data: CreateCardDto, @User() user: AuthUser): HttpResponse {
    const card = await this.cardsService.create(data, user)
    return { success: true, message: 'Card created successfully.', data: { card } }
  }

  @Get('list')
  @Auth()
  async httpListCards(@Query() query: ListCardsDto, @User() user: AuthUser): HttpResponse {
    const cards = await this.cardsService.list(query, user)
    return { success: true, message: 'Fetched cards successfully.', data: { cards } }
  }

  @Put('update')
  @Auth()
  async httpUpdateCard(@Body() data: UpdateCardDto, @User() user: AuthUser): HttpResponse {
    const card = await this.cardsService.update(data, user)
    return { success: true, message: 'Card updated successfully.', data: { card } }
  }
}
