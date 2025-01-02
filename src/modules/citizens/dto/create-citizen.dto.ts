import { Transform } from "class-transformer";
import { IsNotEmpty, IsPhoneNumber, IsStrongPassword, MaxLength } from "class-validator";

export class CreateCitizenDto {
        @IsNotEmpty({ message: 'Tên người dân không được để trống'})
        @MaxLength(50)
        first_name: string;
    
        @IsNotEmpty({ message: 'Tên người dân không được để trống'})
        @MaxLength(50)
        last_name: string;

        @IsNotEmpty({ message: 'Ngày sinh không được để trống'})
        date_of_birth?: Date;
    
        @IsNotEmpty({ message: 'Số điện thoại không được để trống'})
        @IsPhoneNumber('VN', { message: 'Số điện thoại không thuộc vùng Việt Nam' })
        @Transform(({ value }) => formatPhoneNumber(value))
        phone_number: string;

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
