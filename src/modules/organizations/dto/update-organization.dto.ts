import { PartialType } from '@nestjs/mapped-types';
import { CreateOrganizationDto } from './create-organization.dto';
import { OmitType } from '@nestjs/swagger';
import { IsOptional, IsPhoneNumber } from 'class-validator';

export class UpdateOrganizationDto extends PartialType(
    OmitType(CreateOrganizationDto, ['email', 'password', 'username'] as const), 
    )    {

    name: string;

    @IsOptional()
	@IsPhoneNumber()
	phone_number?: string;

    address?: string
}
