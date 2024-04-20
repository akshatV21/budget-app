import { Interval } from '@prisma/client'
import { IsEnum, IsISO8601, IsNotEmpty, IsString, ValidateIf } from 'class-validator'
import { ENTITIES } from 'src/utils/constants'
import { Entity } from 'src/utils/types'

export class ListStatsDto {
  @IsNotEmpty()
  @IsEnum(Interval)
  interval: Interval

  @IsNotEmpty()
  @IsEnum(ENTITIES)
  entity: Entity

  @IsNotEmpty()
  @IsISO8601()
  from: string

  @IsNotEmpty()
  @IsISO8601()
  to: string

  @ValidateIf(o => o.entity === 'account')
  @IsNotEmpty()
  @IsString()
  accountId: string

  @ValidateIf(o => o.entity === 'profile')
  @IsNotEmpty()
  @IsString()
  profileId: string
}
