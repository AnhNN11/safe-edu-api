import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { Model } from 'mongoose';
import { Submission } from './entities/submission.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Citizen } from '@modules/citizens/entities/citizen.entity';
import { Student } from '@modules/students/entities/student.entity';
import { ERRORS_DICTIONARY } from 'src/constraints/error-dictionary.constraint';
import { Question } from '@modules/questions/entities/question.entity';

@Injectable()
export class SubmissionService {
  constructor(
    @InjectModel(Submission.name)
    private readonly submissionModel: Model<Submission>,
    @InjectModel(Citizen.name)
    private readonly citizenModel: Model<Citizen>,
    @InjectModel(Student.name)
    private readonly studentModel: Model<Student>,
    @InjectModel(Question.name)
    private readonly questionModel: Model<Question>
  ){}

  async submitAnswer(createSubmissionDto: CreateSubmissionDto) {
    try {
      const { user_id, question_id } = createSubmissionDto

      const [existed_phone_number_student, existed_phone_number_student_citizen] =
			await Promise.all([
				await this.citizenModel.findById(user_id),
				await this.studentModel.findById(user_id),
			]);

      if (!existed_phone_number_student || !existed_phone_number_student_citizen) {
            throw new BadRequestException({
              message: "Người dùng không tồn tại",
            });
      }

      const question = await this.questionModel.findById(question_id);
      const isCorrect = question.correct_answer === createSubmissionDto.answer;
      const score = isCorrect ? question.point : 0;

      const answer = new this.submissionModel({
        questionId: createSubmissionDto.question_id,
        quizId: question.quiz_id,
        userId: createSubmissionDto.user_id,
        answer: createSubmissionDto.answer,
        isCorrect,
        score,
      })

      await answer.save();

      return({
        isCorrect,
        score
      })

    } catch (error) {
       throw new BadRequestException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: error.message,
       })
    }
  }

  async findAll(
    searchPhase: string = '',
		page: number = 1,
		limit: number = 10,
		sortBy: string = 'createdAt',
		sortOrder: 'asc' | 'desc' = 'asc'
  ): Promise<any> {
    try {
      const filter: any = {};
		if (searchPhase) {
			filter.$or = [
				{ name: new RegExp(searchPhase, 'i') },
				{ description: new RegExp(searchPhase, 'i') }
			];
		}

		const validPage = Number(page) > 0 ? Number(page) : 1;
		const validLimit = Number(limit) > 0 ? Number(limit) : 10;
		const skip = (validPage - 1) * validLimit;
		const sortDirection = sortOrder === 'asc' ? 1 : -1;

		const users = await this.submissionModel.find(filter)
			.skip(skip)
			.limit(limit)
			.sort({ [sortBy]: sortDirection })
      .populate("question_id")
      .populate("user_id")
			.exec();

		const totalItemCount = await this.submissionModel.countDocuments(filter).exec();
		const totalPages = totalItemCount > 0 ? Math.ceil(totalItemCount / validLimit) : 1;
		const itemFrom = totalItemCount === 0 ? 0 : skip + 1;
		const itemTo = Math.min(skip + validLimit, totalItemCount);
		
		const response = {
			items: users,
			totalItemCount: totalItemCount,
			totalPages: totalPages,
			itemFrom: itemFrom,
			itemTo: itemTo
		  };
		
		  return response;
    } catch (error) {
      throw new BadRequestException({
        status: HttpStatus.BAD_REQUEST,
        message: "Đã có lỗi xảy ra trong quá trình xem câu hỏi, vui lòng thử lại sau",
        details: `Đã có lỗi xảy ra: ${error.message}`
      })
    }
  }


  async findOneByUserId(userId: string) {
    try {
      const userSubmission = await this.submissionModel.findOne({user_id: userId})

      return userSubmission;
    } catch (error) {
      throw new BadRequestException({
        status: HttpStatus.BAD_REQUEST,
        message: "Đã có lỗi xảy ra trong quá trình xem câu hỏi, vui lòng thử lại sau",
        details: `Đã có lỗi xảy ra: ${error.message}`
      })
    }
  }

}
