import { IsNotEmpty, IsNumber, IsNumberString, IsOptional, IsString, Min } from 'class-validator'

export class CreateAccountDto {
  @IsNotEmpty()
  @IsString()
  name: string

  @IsNotEmpty()
  @IsString()
  bank: string

  @IsNotEmpty()
  @IsNumberString()
  accountNo: string

  @IsNotEmpty()
  @IsString()
  ifscCode: string

  @IsOptional()
  @IsNumber()
  @Min(0)
  balance: number
}
