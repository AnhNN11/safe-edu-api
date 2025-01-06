import { IsNotEmpty } from "class-validator";

export class SignInTokenDto {
    @IsNotEmpty()
    token: string;
}