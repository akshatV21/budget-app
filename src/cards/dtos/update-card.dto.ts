import { OmitType, PartialType } from '@nestjs/mapped-types'
import { CreateCardDto } from './create-card.dto'
import { IsNotEmpty, IsString } from 'class-validator'

export class UpdateCardDto extends PartialType(OmitType(CreateCardDto, ['accountId'])) {
  @IsNotEmpty()
  @IsString()
  cardId: string
}
