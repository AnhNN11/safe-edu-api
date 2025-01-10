import { IsMongoId, IsNotEmpty, MaxLength } from "class-validator";

export class CreateOrganizationDto {

    @IsNotEmpty({ message: 'Tên trường không được để trống' })
    name: string;

    @IsNotEmpty({ message: 'Id tỉnh thành không được để trống' })
    @IsMongoId({ message: 'id phải là ObjectId hợp lệ' })
    province_id: string
}
