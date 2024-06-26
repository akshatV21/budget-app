import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { DatabaseService } from 'src/database/database.service'
import { CreateCardDto } from './dtos/create-card.dto'
import { AuthUser } from 'src/utils/types'
import { ListCardsDto } from './dtos/list-cards.dto'
import { Prisma } from '@prisma/client'
import { UpdateCardDto } from './dtos/update-card.dto'
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager'
import { TTL } from 'src/utils/constants'

@Injectable()
export class CardsService {
  constructor(
    private readonly db: DatabaseService,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  async create(data: CreateCardDto, user: AuthUser) {
    const duplicateNamePromise = this.db.card.findUnique({
      where: { name_ownerId: { name: data.name, ownerId: user.id } },
      select: { id: true },
    })

    const duplicateNumberPromise = this.db.card.findUnique({
      where: { number: data.number },
      select: { id: true },
    })

    const [duplicateName, duplicateNumber] = await Promise.all([
      duplicateNamePromise,
      duplicateNumberPromise,
    ])

    if (duplicateName) {
      throw new BadRequestException('Card with provided name already exists.')
    }

    if (duplicateNumber) {
      throw new BadRequestException('Card with provided number already exists.')
    }

    const card = await this.db.card.create({
      data: { ...data, ownerId: user.id },
    })

    return card
  }

  async list(query: ListCardsDto, user: AuthUser) {
    const page = query.page ?? 1
    const limit = query.limit ?? 10

    const key = `cards:${query.accountId}:${page}:${limit}`

    const cached = await this.cache.get(key)
    if (cached) return cached

    const where: Prisma.CardWhereInput = { ownerId: user.id }
    if (query.accountId) where.accountId = query.accountId

    const cards = await this.db.card.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        number: true,
        expiry: true,
        type: true,
      },
    })

    await this.cache.set(key, cards, TTL)
    return cards
  }

  async update(data: UpdateCardDto, user: AuthUser) {
    const card = await this.db.card.findUnique({
      where: { id: data.cardId, ownerId: user.id },
      select: { id: true },
    })

    if (!card) {
      throw new BadRequestException('No card found with provided id.')
    }

    const updateData: Prisma.CardUpdateInput = {}

    if (data.name) updateData.name = data.name
    if (data.number) updateData.number = data.number
    if (data.expiry) updateData.expiry = data.expiry
    if (data.cvv) updateData.cvv = data.cvv
    if (data.type) updateData.type = data.type

    await this.db.card.update({
      where: { id: data.cardId },
      data: updateData,
    })
  }
}
