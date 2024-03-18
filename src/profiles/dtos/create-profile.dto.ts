import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString } from 'class-validator'

export class CreateProfileDto {
  @IsNotEmpty()
  @IsString()
  name: string

  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsPhoneNumber('IN')
  phone?: string
}
