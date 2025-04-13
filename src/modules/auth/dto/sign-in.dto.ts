import { Transform } from "class-transformer";
import { IsNotEmpty, IsPhoneNumber } from "class-validator";

export class SignInDto {
    @IsNotEmpty({ message: 'Số điện thoại không được để trống'})
    @IsPhoneNumber('VN', { message: 'Số điện thoại không thuộc vùng Việt Nam' })
    @Transform(({ value }) => formatPhoneNumber(value))
    phone_number: string;

    @IsNotEmpty({message: "OTP không được để trống"})
    otp: string
}

function formatPhoneNumber(phone: string): string {
    if (!phone) return phone;
    if (phone.startsWith('+84')) {
            return phone;
    }
    if (phone.startsWith('0')) {
            return `+84${phone.slice(1)}`;
    }
    return phone;
}