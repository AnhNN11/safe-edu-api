import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsEmail,
  IsString,
  IsStrongPassword,
  MaxLength,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @MaxLength(50)
  first_name: string;

  @IsNotEmpty()
  @MaxLength(50)
  last_name: string;

  @IsNotEmpty()
  @MaxLength(50)
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MaxLength(50)
  username: string;

  @IsOptional()
  @IsPhoneNumber('VN')
  phone_number?: string;

  @IsNotEmpty()
  @IsStrongPassword()
  password?: string;

  @IsNotEmpty()
  role?: string; 
}
