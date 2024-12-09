import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsStrongPassword, MaxLength } from "class-validator";

export class CreateOrganizationDto {

    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    address?: string
}
