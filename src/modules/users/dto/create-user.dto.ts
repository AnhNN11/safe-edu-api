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

  @IsOptional()
  @MaxLength(50)
  @IsEmail()
  email: string;

  @IsOptional()
  @MaxLength(50)
  username: string;

  @IsOptional()
  organizationId: string;

  @IsNotEmpty()
  @IsPhoneNumber('VN')
  phone_number?: string;

  @IsNotEmpty()
  @IsStrongPassword()
  password?: string;

  @IsNotEmpty()
  role?: string; 
}
