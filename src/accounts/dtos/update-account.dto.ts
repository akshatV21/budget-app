import { PartialType } from '@nestjs/mapped-types'
import { CreateAccountDto } from './create-account.dto'
import { IsNotEmpty, IsString } from 'class-validator'

export class UpdateAccountDto extends PartialType(CreateAccountDto) {
  @IsNotEmpty()
  @IsString()
  accountId: string
}
