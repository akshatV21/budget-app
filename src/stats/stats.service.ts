import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns'
import { DatabaseService } from 'src/database/database.service'
import { EVENTS } from 'src/utils/constants'
import { IntervalDates, Operation, TransactionCreatedDto } from 'src/utils/types'

@Injectable()
export class StatsService {
  constructor(private readonly db: DatabaseService) {}

  @OnEvent(EVENTS.TRANSACTION_CREATED)
  private async handleTransactionCreatedEvent(data: TransactionCreatedDto) {
    const currentDate = new Date()

    const dates = this.generateIntervalDates(currentDate)
    const operation = data.type === 'credit' ? 'credited' : 'debited'

    console.log(`
    id: ${data.transactionId}
    event: 'transaction-created'
    message: 'Started handling transaction created event'
    `)

    try {
      console.time(`TIME [${data.transactionId}]`)
      await this.handleAccountStats(data, dates, operation)
      console.timeEnd(`TIME [${data.transactionId}]`)
    } catch (error) {
      console.log(`
        id: ${data.transactionId}
        event: 'transaction-created'
        message: 'Error handling account stats'
        error: ${error.message}
        `)
    }

    console.log(`
    id: ${data.transactionId}
    event: 'transaction-created'
    message: 'Successfully handled transaction created event.'
    `)
  }

  private async handleAccountStats(
    data: TransactionCreatedDto,
    dates: IntervalDates,
    operation: Operation,
  ) {
    console.log(`
    id: ${data.transactionId}
    event: 'transaction-created'
    message: 'Handling account stats'
    `)

    await this.db.$transaction(async tdb => {
      const weeklyStatsPromise = tdb.accountStats.upsert({
        where: {
          from_to_interval_accountId: {
            from: dates.weekly.from,
            to: dates.weekly.to,
            accountId: data.accountId,
            interval: 'weekly',
          },
        },
        create: {
          from: dates.weekly.from,
          to: dates.weekly.to,
          accountId: data.accountId,
          interval: 'weekly',
        },
        update: { [operation]: { increment: data.amount } },
      })

      const monthlyStatsPromise = tdb.accountStats.upsert({
        where: {
          from_to_interval_accountId: {
            from: dates.monthly.from,
            to: dates.monthly.to,
            accountId: data.accountId,
            interval: 'monthly',
          },
        },
        create: {
          from: dates.monthly.from,
          to: dates.monthly.to,
          accountId: data.accountId,
          interval: 'monthly',
        },
        update: { [operation]: { increment: data.amount } },
      })

      const yearlyStatsPromise = tdb.accountStats.upsert({
        where: {
          from_to_interval_accountId: {
            from: dates.yearly.from,
            to: dates.yearly.to,
            accountId: data.accountId,
            interval: 'yearly',
          },
        },
        create: {
          from: dates.yearly.from,
          to: dates.yearly.to,
          accountId: data.accountId,
          interval: 'yearly',
        },
        update: { [operation]: { increment: data.amount } },
      })

      await Promise.all([weeklyStatsPromise, monthlyStatsPromise, yearlyStatsPromise])
    })

    console.log(`
    id: ${data.transactionId}
    event: 'transaction-created'
    message: 'Handled account stats successfully'
    `)
  }

  private generateIntervalDates(currentDate: Date): IntervalDates {
    return {
      weekly: {
        from: startOfWeek(currentDate),
        to: endOfWeek(currentDate),
      },
      monthly: {
        from: startOfMonth(currentDate),
        to: endOfMonth(currentDate),
      },
      yearly: {
        from: startOfYear(currentDate),
        to: endOfYear(currentDate),
      },
    }
  }
}
