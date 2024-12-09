import { IsNotEmpty } from 'class-validator';

export class UpdateOrganizationDto {

    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    address?: string
}
