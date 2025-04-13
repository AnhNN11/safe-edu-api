import { IsNotEmpty } from "class-validator";

export class CreateSubmissionDto {
    @IsNotEmpty({message: "Người làm bài không được để trống"})
    user_id: string;

    @IsNotEmpty({message: "Id câu hỏi không được để trống "})
    question_id: string;
}
