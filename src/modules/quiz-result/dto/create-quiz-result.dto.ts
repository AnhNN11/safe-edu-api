import { IsNotEmpty } from "class-validator";

export class CreateQuizResultDto {
    @IsNotEmpty({message: "tên người nộp bài không được để trống "})
    userId: string;

    @IsNotEmpty({message: "tên câu hỏi không được để trống "})
    quizId: string;
}
