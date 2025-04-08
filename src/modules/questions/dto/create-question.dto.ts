import { IsNotEmpty, IsOptional } from "class-validator";
import mongoose from "mongoose";

export class CreateQuestionDto {
    @IsNotEmpty({message: "Câu hỏi không được để trống"})
    question: string;
    
    @IsNotEmpty({message: "Lựa chọn cho câu hỏi không được để trống"})
    answer?: string[]

    @IsNotEmpty({message: "Câu trả lời không được để trống"})
    correct_answer?: string

    @IsOptional()
    image?: string
    
    @IsOptional()
    time_limit?: number
    
    @IsOptional()
    point?: number

    @IsNotEmpty({message: "loại câu hỏi không được để trống"})
    quiz_id: string

}
