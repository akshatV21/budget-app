import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common'
import { DatabaseService } from 'src/database/database.service'
import { CreateAccountDto } from './dtos/create-account.dto'
import { AuthUser } from 'src/utils/types'
import { PaginationDto } from 'src/utils/dtos'
import { Prisma } from '@prisma/client'
import { UpdateAccountDto } from './dtos/update-account.dto'

@Injectable()
export class AccountsService {
  constructor(private readonly db: DatabaseService) {}

  async create(data: CreateAccountDto, user: AuthUser) {
    const duplicateNamePromise = this.db.account.findUnique({
      where: { ownerId_name: { ownerId: user.id, name: data.name } },
      select: { id: true },
    })

    const duplicateAccNoPromise = this.db.account.findUnique({
      where: { ownerId_accountNo: { ownerId: user.id, accountNo: data.accountNo } },
      select: { id: true },
    })

    const [duplicateName, duplicateAccNo] = await Promise.all([duplicateNamePromise, duplicateAccNoPromise])

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
    const account = await this.db.account.findUnique({
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

    if (!account) {
      throw new BadRequestException('No account found with provided id.')
    }

    if (account.ownerId !== user.id) {
      throw new ForbiddenException('You are not authorized to view this account.')
    }

    return account
  }

  async list(pagination: PaginationDto, user: AuthUser) {
    const page = pagination.page ?? 1
    const limit = pagination.limit ?? 10

    const where: Prisma.AccountWhereInput = { ownerId: user.id }
    if (pagination.search) where.name = { contains: pagination.search, mode: 'insensitive' }

    const accounts = await this.db.account.findMany({
      where,
      take: limit,
      skip: (page - 1) * limit,
      select: { id: true, name: true, bank: true, balance: true },
    })

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
