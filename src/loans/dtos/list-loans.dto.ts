import { IsOptional, IsString } from 'class-validator'
import { PaginationDto } from 'src/utils/dtos'

export class ListLoansDto extends PaginationDto {
  @IsOptional()
  @IsString()
  profileId: string
}
