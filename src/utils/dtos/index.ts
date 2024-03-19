import { IsNumber, IsOptional, IsString } from 'class-validator'
import { Transform } from 'class-transformer'

export class PaginationDto {
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  page?: number

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  limit?: number

  @IsOptional()
  @IsString()
  search?: string
}
