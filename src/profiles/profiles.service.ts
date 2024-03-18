import { BadRequestException, Injectable } from '@nestjs/common'
import { DatabaseService } from 'src/database/database.service'
import { CreateProfileDto } from './dtos/create-profile.dto'

@Injectable()
export class ProfilesService {
  constructor(private readonly db: DatabaseService) {}

  async create(createProfileDto: CreateProfileDto) {
    // const duplicateName = await this.db.profile.findUnique({
    //   where: { name: createProfileDto.name },
    //   select: {},
    // })
    // if (duplicateName) {
    //   throw new BadRequestException('Provided profile name is already in use.')
    // }
    // const profile = await this.db.profile.create({
    //   data: createProfileDto,
    // })
  }
}
