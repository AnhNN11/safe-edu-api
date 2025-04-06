import { IsMongoId, IsNotEmpty, IsObject, MaxLength } from "class-validator";

export class CreateOrganizationDto {

    @IsNotEmpty({ message: 'Tên trường không được để trống' })
    name: string;

    @IsMongoId({ message: 'Id tỉnh thành không hợp lệ' })
    @IsNotEmpty({ message: 'Id tỉnh thành không được để trống' })
    province_id: string

    @IsNotEmpty({message: 'Email của quản lí không được để trống'})
    email: string

    @IsNotEmpty({message: 'Slug không được bỏ trống'})
    slug: string
}
