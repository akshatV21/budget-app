import { IsOptional, IsString } from 'class-validator'
import { PaginationDto } from '../../utils/dtos'

export class ListTransactionsDto extends PaginationDto {
  @IsOptional()
  @IsString()
  profileId?: string

  @IsOptional()
  @IsString()
  accountId?: string

  @IsOptional()
  @IsString()
  loanId?: string
}
