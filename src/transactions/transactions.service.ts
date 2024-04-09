import { BadRequestException, Injectable } from '@nestjs/common'
import { DatabaseService } from 'src/database/database.service'
import { CreateTransactionDto } from './dtos/create-transaction.dto'
import { AuthUser } from 'src/utils/types'
import { Prisma } from '@prisma/client'

@Injectable()
export class TransactionsService {
  constructor(private readonly db: DatabaseService) {}

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

    return transaction
  }

  private async upsertLoan(amount: number, profileId: string, ownerId: string, tdb: Prisma.TransactionClient) {
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
