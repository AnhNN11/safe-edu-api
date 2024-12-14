import { IsNotEmpty } from "class-validator";

export class SignInDto {
    @IsNotEmpty()
    id: string;
}