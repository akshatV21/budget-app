import { Injectable } from '@nestjs/common'
import { DatabaseService } from 'src/database/database.service'
import { ListLoansDto } from './dtos/list-loans.dto'
import { AuthUser } from 'src/utils/types'
import { Prisma } from '@prisma/client'

@Injectable()
export class LoansService {
  constructor(private readonly db: DatabaseService) {}

  async list(query: ListLoansDto, user: AuthUser) {
    const page = query.page ?? 1
    const limit = query.limit ?? 10

    const where: Prisma.LoanWhereInput = { ownerId: user.id }
    if (query.profileId) where.profileId = query.profileId

    const loans = await this.db.loan.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
    })

    return loans
  }
}
