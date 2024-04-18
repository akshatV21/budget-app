import { BadRequestException, ForbiddenException, Inject, Injectable } from '@nestjs/common'
import { DatabaseService } from 'src/database/database.service'
import { CreateAccountDto } from './dtos/create-account.dto'
import { AuthUser } from 'src/utils/types'
import { PaginationDto } from 'src/utils/dtos'
import { Prisma } from '@prisma/client'
import { UpdateAccountDto } from './dtos/update-account.dto'
import { endOfWeek, startOfWeek } from 'date-fns'
import { generateDatesByInterval } from 'src/utils/functions'
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager'
import { TTL } from 'src/utils/constants'

@Injectable()
export class AccountsService {
  constructor(
    private readonly db: DatabaseService,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  async create(data: CreateAccountDto, user: AuthUser) {
    const duplicateNamePromise = this.db.account.findUnique({
      where: { ownerId_name: { ownerId: user.id, name: data.name } },
      select: { id: true },
    })

    const duplicateAccNoPromise = this.db.account.findUnique({
      where: { ownerId_accountNo: { ownerId: user.id, accountNo: data.accountNo } },
      select: { id: true },
    })

    const [duplicateName, duplicateAccNo] = await Promise.all([
      duplicateNamePromise,
      duplicateAccNoPromise,
    ])

    if (duplicateName) {
      throw new BadRequestException('Provided account name already exists')
    }

    if (duplicateAccNo) {
      throw new BadRequestException('Provided account number already exists')
    }

    const account = await this.db.account.create({
      data: { ...data, ownerId: user.id },
    })

    return account
  }

  async getById(accountId: string, user: AuthUser) {
    const currentDate = new Date()
    const dates = generateDatesByInterval(currentDate, user.interval)

    const key = `account:${accountId}:${dates.from}:${dates.to}`

    const cached = await this.cache.get(key)
    if (cached) return cached

    const accountPromise = this.db.account.findUnique({
      where: { id: accountId },
      select: {
        id: true,
        name: true,
        bank: true,
        accountNo: true,
        ifscCode: true,
        balance: true,
        ownerId: true,
      },
    })

    const statsPromise = this.db.accountStats.findUnique({
      where: {
        from_to_interval_accountId: {
          from: dates.from,
          to: dates.to,
          interval: user.interval,
          accountId,
        },
      },
      select: { id: true, from: true, to: true, credited: true, debited: true },
    })

    const [account, stats] = await Promise.all([accountPromise, statsPromise])

    if (!account) {
      throw new BadRequestException('No account found with provided id.')
    }

    if (account.ownerId !== user.id) {
      throw new ForbiddenException('You are not authorized to view this account.')
    }

    const res = { ...account, stats }
    await this.cache.set(key, res, TTL)

    console.log('CACHE MISS')

    return res
  }

  async list(pagination: PaginationDto, user: AuthUser) {
    const page = pagination.page ?? 1
    const limit = pagination.limit ?? 10

    const key = `accounts:${user.id}:${page}:${limit}`

    const cached = await this.cache.get(key)
    if (cached) return cached

    const where: Prisma.AccountWhereInput = { ownerId: user.id }
    if (pagination.search) where.name = { contains: pagination.search, mode: 'insensitive' }

    const accounts = await this.db.account.findMany({
      where,
      take: limit,
      skip: (page - 1) * limit,
      select: { id: true, name: true, bank: true, balance: true },
    })

    await this.cache.set(key, accounts, TTL)
    console.log('CACHE MISS')

    return accounts
  }

  async update(data: UpdateAccountDto, user: AuthUser) {
    const account = await this.db.account.findUnique({
      where: { id: data.accountId },
      select: { ownerId: true },
    })

    if (!account) {
      throw new BadRequestException('No account found with provided id.')
    }

    if (account.ownerId !== user.id) {
      throw new BadRequestException('You are not authorized to update this account.')
    }

    const updateData: Prisma.AccountUpdateInput = {}

    if (data.name) updateData.name = data.name
    if (data.bank) updateData.bank = data.bank
    if (data.accountNo) updateData.accountNo = data.accountNo
    if (data.ifscCode) updateData.ifscCode = data.ifscCode
    if (data.balance) updateData.balance = data.balance

    await this.db.account.update({
      where: { id: data.accountId },
      data: updateData,
    })
  }
}
