import { BadRequestException, Injectable } from '@nestjs/common'
import { DatabaseService } from 'src/database/database.service'
import { CreateAccountDto } from './dtos/create-account.dto'
import { AuthUser } from 'src/utils/types'

@Injectable()
export class AccountsService {
  constructor(private readonly db: DatabaseService) {}

  async create(data: CreateAccountDto, user: AuthUser) {
    const duplicateNamePromise = this.db.account.findUnique({
      where: { name: data.name, ownerId: user.id },
      select: { id: true },
    })

    const duplicateAccNoPromise = this.db.account.findUnique({
      where: { accountNo: data.accountNo },
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
}
