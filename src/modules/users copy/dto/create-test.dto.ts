import { Type } from 'class-transformer';
import {
	ArrayMinSize,
	IsArray,
	IsEmail,
	IsEnum,
	IsNotEmpty,
	IsOptional,
	IsPhoneNumber,
	IsStrongPassword,
	MaxLength,
	ValidateNested,
} from 'class-validator';

export class CreateTestDto {
	@IsNotEmpty()
	@MaxLength(50)
	@IsEmail()
	email: string;
}
