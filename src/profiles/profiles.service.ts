import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { DatabaseService } from 'src/database/database.service'
import { CreateProfileDto } from './dtos/create-profile.dto'
import { Prisma } from '@prisma/client'
import { PaginationDto } from 'src/utils/dtos'
import { AuthUser } from 'src/utils/types'
import { UpdateProfileDto } from './dtos/update-profile.dto'
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager'
import { TTL } from 'src/utils/constants'

@Injectable()
export class ProfilesService {
  constructor(
    private readonly db: DatabaseService,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  async create(createProfileDto: CreateProfileDto, userId: string) {
    const duplicate = await this.db.profile.findUnique({
      where: { name_ownerId: { name: createProfileDto.name, ownerId: userId } },
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

    const key = `profiles:${userId}:${page}:${limit}`

    const cached = await this.cache.get(key)
    if (cached) return cached

    const where: Prisma.ProfileWhereInput = { ownerId: userId }
    if (pagination.search) where.name = { contains: pagination.search, mode: 'insensitive' }

    const profiles = await this.db.profile.findMany({
      where,
      take: limit,
      skip: (page - 1) * limit,
      select: { id: true, name: true, avatar: true },
    })

    await this.cache.set(key, profiles, TTL)
    return profiles
  }

  async update(data: UpdateProfileDto, user: AuthUser) {
    const profile = await this.db.profile.findUnique({
      where: { id: data.profileId },
      select: { id: true, ownerId: true },
    })

    if (!profile) {
      throw new BadRequestException('No profile found with provided id.')
    }

    if (profile.ownerId !== user.id) {
      throw new BadRequestException('You are not authorized to update this profile.')
    }

    const updateData: Prisma.ProfileUpdateInput = {}

    if (data.name) updateData.name = data.name
    if (data.email) updateData.email = data.email
    if (data.phone) updateData.phone = data.phone

    await this.db.profile.update({
      where: { id: data.profileId },
      data: updateData,
    })
  }

  async delete(profileId: string, user: AuthUser) {
    const profile = await this.db.profile.findUnique({
      where: { id: profileId },
      select: { id: true, ownerId: true },
    })

    if (!profile) {
      throw new BadRequestException('No profile found with provided id.')
    }

    if (profile.ownerId !== user.id) {
      throw new BadRequestException('You are not authorized to delete this profile.')
    }

    await this.db.profile.delete({ where: { id: profileId } })
  }
}
