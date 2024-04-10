import { IsNumber, IsOptional, IsString } from 'class-validator'
import { Transform } from 'class-transformer'
import { Order } from '../types'

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

  @IsOptional()
  @IsString()
  order?: Order
}
