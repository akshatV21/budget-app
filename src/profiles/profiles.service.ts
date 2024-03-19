import { BadRequestException, Injectable } from '@nestjs/common'
import { DatabaseService } from 'src/database/database.service'
import { CreateProfileDto } from './dtos/create-profile.dto'
import { Prisma } from '@prisma/client'
import { PaginationDto } from 'src/utils/dtos'

@Injectable()
export class ProfilesService {
  constructor(private readonly db: DatabaseService) {}

  async create(createProfileDto: CreateProfileDto, userId: string) {
    const duplicate = await this.db.profile.findUnique({
      where: { name: createProfileDto.name },
      select: { id: true },
    })

    if (duplicate) {
      throw new BadRequestException('Provided profile name already exists')
    }

    const profile = await this.db.profile.create({
      data: { ...createProfileDto, ownerId: userId },
    })

    return profile
  }

  async list(pagination: PaginationDto, userId: string) {
    const page = pagination.page ?? 1
    const limit = pagination.limit ?? 20

    const where: Prisma.ProfileWhereInput = { ownerId: userId }
    if (pagination.search) where.name = { contains: pagination.search }

    const profiles = await this.db.profile.findMany({
      where,
      take: limit,
      skip: (page - 1) * limit,
    })

    return profiles
  }
}
