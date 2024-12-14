import { IsNotEmpty, IsStrongPassword, MaxLength } from "class-validator";

export class CreateStudentDto {
    @IsNotEmpty()
    @MaxLength(50)
    first_name: string;

    @IsNotEmpty()
    @MaxLength(50)
    last_name: string;

    @IsNotEmpty()
    @MaxLength(50)
    phone_number: string;

    @IsNotEmpty()
    @IsStrongPassword()
    password: string;
    
    @IsNotEmpty()
    organizationId: string;
}
