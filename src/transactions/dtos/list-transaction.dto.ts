import { IsISO8601, IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator'
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

  @ValidateIf(o => o.to)
  @IsNotEmpty()
  @IsISO8601()
  from?: string

  @ValidateIf(o => o.from)
  @IsNotEmpty()
  @IsISO8601()
  to?: string
}
