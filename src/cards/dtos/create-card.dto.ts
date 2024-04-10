import { CardType } from '@prisma/client'
import { IsEnum, IsNotEmpty, IsNumberString, IsString } from 'class-validator'

export class CreateCardDto {
  @IsNotEmpty()
  @IsString()
  name: string

  @IsNotEmpty()
  @IsNumberString()
  number: string

  @IsNotEmpty()
  @IsString()
  expiry: string

  @IsNotEmpty()
  @IsNumberString()
  cvv: string

  @IsNotEmpty()
  @IsEnum(CardType)
  type: CardType

  @IsNotEmpty()
  @IsString()
  accountId: string
}
