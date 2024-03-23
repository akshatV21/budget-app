import { IsOptional, IsString } from 'class-validator'
import { PaginationDto } from 'src/utils/dtos'

export class ListCardsDto extends PaginationDto {
  @IsOptional()
  @IsString()
  accountId?: string
}
