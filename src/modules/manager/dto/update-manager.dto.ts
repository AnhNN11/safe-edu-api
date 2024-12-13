import { OmitType, PartialType } from '@nestjs/swagger';
import {
	IsDateString,
	IsEnum,
	IsNotEmpty,
	IsOptional,
	IsPhoneNumber,
	MaxLength,
} from 'class-validator';



import { GENDER } from '@modules/users/entities/user.entity';
import { CreateManagerDto } from './create-manager.dto';

export class UpdateManagerDto extends PartialType(
	OmitType(CreateManagerDto, ['email', 'password'] as const),
) {
	@IsOptional()
	@IsPhoneNumber()
	phone_number?: string;

	@IsOptional()
	@IsDateString()
	date_of_birth?: Date;

	@IsOptional()
	@IsEnum(GENDER)
	gender?: GENDER;

	@IsOptional()
	@MaxLength(200)
	headline?: string;


}
