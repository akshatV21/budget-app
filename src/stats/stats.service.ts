import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  differenceInWeeks,
} from 'date-fns'
import { DatabaseService } from 'src/database/database.service'
import { EVENTS, LIMITS } from 'src/utils/constants'
import { generateIntervalDates } from 'src/utils/functions'
import { AuthUser, IntervalDates, Operation, TransactionCreatedDto } from 'src/utils/types'
import { ListStatsDto } from './dtos/list-stats.dto'

@Injectable()
export class StatsService {
  constructor(private readonly db: DatabaseService) {}

  async list(query: ListStatsDto, user: AuthUser) {
    this.validateIntervalLimit(query)

    if (query.entity === 'account') {
      return this.listAccountStats(query, user)
    }

    if (query.entity === 'profile') {
      return this.listProfileStats(query, user)
    }

    throw new BadRequestException(`Invalid entity provided.`)
  }

  private async listAccountStats(query: ListStatsDto, user: AuthUser) {
    const account = await this.db.account.findUnique({
      where: { id: query.accountId },
      select: { ownerId: true },
    })

    if (!account) {
      throw new BadRequestException('No account found with provided id.')
    }

    if (account.ownerId !== user.id) {
      throw new ForbiddenException('You are not allowed to view stats for this account.')
    }

    const stats = await this.db.accountStats.findMany({
      where: {
        interval: query.interval,
        from: { gte: query.from },
        to: { lte: query.to },
        accountId: query.accountId,
      },
      select: { id: true, from: true, to: true, credited: true, debited: true },
    })

    return stats
  }

  private async listProfileStats(query: ListStatsDto, user: AuthUser) {
    const profile = await this.db.profile.findUnique({
      where: { id: query.profileId },
      select: { ownerId: true },
    })

    if (!profile) {
      throw new BadRequestException('No profile found with provided id.')
    }

    if (profile.ownerId !== user.id) {
      throw new ForbiddenException('You are not allowed to view stats for this profile.')
    }

    const stats = await this.db.profileStats.findMany({
      where: {
        interval: query.interval,
        from: { gte: query.from },
        to: { lte: query.to },
        profileId: query.profileId,
      },
      select: { id: true, from: true, to: true, credited: true, debited: true },
    })

    return stats
  }

  private validateIntervalLimit(query: ListStatsDto) {
    if (query.interval === 'weekly' && this.exceedsWeeksLimit(query.from, query.to)) {
      throw new BadRequestException(
        `Provided interval exceeds the limit of weeks allowed (${LIMITS.WEEKS}).`,
      )
    }

    if (query.interval === 'monthly' && this.exceedsMonthsLimit(query.from, query.to)) {
      throw new BadRequestException(
        `Provided interval exceeds the limit of months allowed (${LIMITS.MONTHS}).`,
      )
    }

    if (query.interval === 'yearly' && this.exceedsYearsLimit(query.from, query.to)) {
      throw new BadRequestException(
        `Provided interval exceeds the limit of years allowed (${LIMITS.YEARS}).`,
      )
    }
  }

  private exceedsWeeksLimit(from: string, to: string) {
    const weekCount = differenceInWeeks(startOfWeek(from), endOfWeek(to))
    return weekCount > LIMITS.WEEKS
  }

  private exceedsMonthsLimit(from: string, to: string) {
    const monthCount = differenceInWeeks(startOfMonth(from), endOfMonth(to))
    return monthCount > LIMITS.MONTHS
  }

  private exceedsYearsLimit(from: string, to: string) {
    const yearCount = differenceInWeeks(startOfYear(from), endOfYear(to))
    return yearCount > LIMITS.YEARS
  }

  @OnEvent(EVENTS.TRANSACTION_CREATED)
  private async handleTransactionCreatedEvent(data: TransactionCreatedDto) {
    const currentDate = new Date()

    const dates = generateIntervalDates(currentDate)
    const operation = data.type === 'credit' ? 'credited' : 'debited'

    console.log(`
    id: ${data.transactionId}
    event: 'transaction-created'
    message: 'Started handling transaction created event'
    `)

    try {
      await Promise.all([
        this.handleAccountStats(data, dates, operation),
        this.handleProfileStats(data, dates, operation),
      ])
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
          [operation]: data.amount,
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
          [operation]: data.amount,
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
          [operation]: data.amount,
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

  async handleProfileStats(
    data: TransactionCreatedDto,
    dates: IntervalDates,
    operation: Operation,
  ) {
    console.log(`
    id: ${data.transactionId}
    event: 'transaction-created'
    message: 'Handling profile stats'
    `)

    await this.db.$transaction(async tdb => {
      const weeklyStatsPromise = tdb.profileStats.upsert({
        where: {
          from_to_interval_profileId: {
            from: dates.weekly.from,
            to: dates.weekly.to,
            profileId: data.profileId,
            interval: 'weekly',
          },
        },
        create: {
          from: dates.weekly.from,
          to: dates.weekly.to,
          profileId: data.profileId,
          interval: 'weekly',
          [operation]: data.amount,
        },
        update: { [operation]: { increment: data.amount } },
      })

      const monthlyStatsPromise = tdb.profileStats.upsert({
        where: {
          from_to_interval_profileId: {
            from: dates.monthly.from,
            to: dates.monthly.to,
            profileId: data.profileId,
            interval: 'monthly',
          },
        },
        create: {
          from: dates.monthly.from,
          to: dates.monthly.to,
          profileId: data.profileId,
          interval: 'monthly',
          [operation]: data.amount,
        },
        update: { [operation]: { increment: data.amount } },
      })

      const yearlyStatsPromise = tdb.profileStats.upsert({
        where: {
          from_to_interval_profileId: {
            from: dates.yearly.from,
            to: dates.yearly.to,
            profileId: data.profileId,
            interval: 'yearly',
          },
        },
        create: {
          from: dates.yearly.from,
          to: dates.yearly.to,
          profileId: data.profileId,
          interval: 'yearly',
          [operation]: data.amount,
        },
        update: { [operation]: { increment: data.amount } },
      })

      await Promise.all([weeklyStatsPromise, monthlyStatsPromise, yearlyStatsPromise])
    })

    console.log(`
    id: ${data.transactionId}
    event: 'transaction-created'
    message: 'Handled profile stats successfully'
    `)
  }
}
