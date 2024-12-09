import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsStrongPassword, MaxLength } from "class-validator";

export class CreateOrganizationDto {
    @IsNotEmpty()
	@MaxLength(50)
	@IsEmail()
	email: string;

    @IsNotEmpty()
    name: string;

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
    address?: string
}
