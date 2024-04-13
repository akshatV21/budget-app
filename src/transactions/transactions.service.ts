import { BadRequestException, Injectable } from '@nestjs/common'
import { DatabaseService } from 'src/database/database.service'
import { CreateTransactionDto } from './dtos/create-transaction.dto'
import { AuthUser, TransactionCreatedDto } from 'src/utils/types'
import { Prisma } from '@prisma/client'
import { ListTransactionsDto } from './dtos/list-transaction.dto'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { EVENTS } from 'src/utils/constants'

@Injectable()
export class TransactionsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly emitter: EventEmitter2,
  ) {}

  async create(data: CreateTransactionDto, user: AuthUser) {
    const profilePromise = this.db.profile.findUnique({
      where: { id: data.profileId, ownerId: user.id },
      select: { id: true },
    })

    const accountPromise = this.db.account.findUnique({
      where: { id: data.accountId, ownerId: user.id },
      select: { id: true },
    })

    const [profile, account] = await Promise.all([profilePromise, accountPromise])

    if (!profile) {
      throw new BadRequestException('No profile found with provided id.')
    }

    if (!account) {
      throw new BadRequestException('No account found with provided id.')
    }

    let transaction = null

    await this.db.$transaction(async tdb => {
      let loanId = data.loanId ?? null

      if (data.category === 'loan') {
        const loan = await this.upsertLoan(data.amount, data.profileId, user.id, tdb)
        loanId = loan.id
      }

      if (data.category === 'repayment') {
        await this.handleRepayment(data.loanId, data.amount, tdb)
      }

      let operation = data.type === 'credit' ? 'increment' : 'decrement'

      const createTransactionPromise = tdb.transaction.create({
        data: { ...data, ownerId: user.id, loanId },
      })

      const updateAccountPromise = tdb.account.update({
        where: { id: data.accountId },
        data: { balance: { [operation]: data.amount } },
      })

      const resolved = await Promise.all([createTransactionPromise, updateAccountPromise])
      transaction = resolved[0]
    })

    const payload: TransactionCreatedDto = {
      transactionId: transaction.id,
      type: transaction.type,
      amount: transaction.amount,
      profileId: transaction.profileId,
      accountId: transaction.accountId,
    }

    this.emitter.emitAsync(EVENTS.TRANSACTION_CREATED, payload)
    return transaction
  }

  async getById(transactionId: string, user: AuthUser) {
    const transaction = await this.db.transaction.findUnique({
      where: { id: transactionId, ownerId: user.id },
      select: {
        id: true,
        amount: true,
        type: true,
        category: true,
        account: { select: { id: true, name: true } },
        loan: true,
        profile: { select: { id: true, name: true, avatar: true } },
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!transaction) {
      throw new BadRequestException('No transaction found with provided id.')
    }

    return transaction
  }

  async list(query: ListTransactionsDto, user: AuthUser) {
    const page = query.page ?? 1
    const limit = query.limit ?? 10

    const where: Prisma.TransactionWhereInput = { ownerId: user.id }

    if (query.loanId) where.loanId = query.loanId
    if (query.profileId) where.profileId = query.profileId
    if (query.accountId) where.accountId = query.accountId

    const transactions = await this.db.transaction.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        amount: true,
        type: true,
        category: true,
        loanId: true,
        account: { select: { id: true, name: true } },
        profile: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: query.order ?? 'desc' },
    })

    return transactions
  }

  async clean() {
    await this.db.loan.deleteMany({})
    await this.db.transaction.deleteMany({})
    await this.db.accountStats.deleteMany({})
  }

  private async upsertLoan(
    amount: number,
    profileId: string,
    ownerId: string,
    tdb: Prisma.TransactionClient,
  ) {
    return tdb.loan.upsert({
      where: { ownerId_profileId: { ownerId, profileId } },
      create: { remaining: amount, profileId, ownerId, status: 'pending' },
      update: { remaining: { increment: amount } },
    })
  }

  private async handleRepayment(loanId: string, amount: number, tdb: Prisma.TransactionClient) {
    const loan = await tdb.loan.findUnique({
      where: { id: loanId },
      select: { remaining: true, status: true },
    })

    if (!loan) {
      throw new BadRequestException('No loan found with provided id.')
    }

    if (loan.remaining < amount) {
      throw new BadRequestException('Amount exceeds remaining loan balance.')
    }

    const allIsPaid = loan.remaining === amount

    return tdb.loan.update({
      where: { id: loanId },
      data: {
        remaining: { decrement: amount },
        status: allIsPaid ? 'cleared' : 'pending',
      },
    })
  }
}
