import { PartialType } from '@nestjs/mapped-types'
import { CreateProfileDto } from './create-profile.dto'
import { IsNotEmpty, IsString } from 'class-validator'

export class UpdateProfileDto extends PartialType(CreateProfileDto) {
  @IsNotEmpty()
  @IsString()
  profileId: string
}
