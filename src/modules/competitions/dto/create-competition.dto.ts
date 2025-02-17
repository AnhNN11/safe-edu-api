import { IsEnum, IsNotEmpty, MaxLength } from "class-validator";

export class CreateCompetitionDto {
    @IsNotEmpty({message: 'Tên cuộc thi không được để trống'})
    @MaxLength(50)
    title: string;

    @IsNotEmpty({message: 'Mô tả cuộc thi không được bỏ trống'})
    @MaxLength(50)
    description: string;

    @IsNotEmpty({message: 'Trường này là bắt buộc'})
    startDate: Date;

    @IsNotEmpty({message: 'Trường này là bắt buộc'})
    endDate: Date;

    image_url: string;
    video: string;

    @IsNotEmpty({message: 'Trạng thái là bắt buộc'})
    @IsEnum(['Upcoming', 'Ongoing', 'Completed'], { message: 'Trạng thái không hợp lệ' })
    status: 'Upcoming' | 'Ongoing' | 'Completed';

}
