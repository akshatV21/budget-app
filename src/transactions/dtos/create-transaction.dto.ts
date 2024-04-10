import { TransactionCategory, TransactionType } from '@prisma/client'
import { IsEnum, IsNotEmpty, IsNumber, IsString, ValidateIf } from 'class-validator'

export class CreateTransactionDto {
  @IsNotEmpty()
  @IsString()
  profileId: string

  @IsNotEmpty()
  @IsNumber()
  amount: number

  @IsNotEmpty()
  @IsEnum(TransactionType)
  type: TransactionType

  @IsNotEmpty()
  @IsEnum(TransactionCategory)
  category: TransactionCategory

  @IsNotEmpty()
  @IsString()
  accountId: string

  @ValidateIf(o => o.category === TransactionCategory.loan)
  @IsString()
  loanId?: string
}
