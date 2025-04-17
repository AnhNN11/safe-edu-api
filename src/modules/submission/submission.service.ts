import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { Model } from 'mongoose';
import { Submission } from './entities/submission.entity';
import { InjectModel } from '@nestjs/mongoose';
import { ERRORS_DICTIONARY } from 'src/constraints/error-dictionary.constraint';
import { Question } from '@modules/questions/entities/question.entity';

@Injectable()
export class SubmissionService {
	constructor(
		@InjectModel(Submission.name)
		private readonly submissionModel: Model<Submission>,
		@InjectModel(Question.name)
		private readonly questionModel: Model<Question>,
	) {}

	async submitAnswer(
		createSubmissionDto: CreateSubmissionDto,
		user_id: string,
	) {
		try {
			const { question_id, answer = null } = createSubmissionDto;

			const question = await this.questionModel.findById(question_id);
			if (!question) {
				throw new BadRequestException({
					status: HttpStatus.BAD_REQUEST,
					message: ERRORS_DICTIONARY.QUESTION_NOT_FOUND,
				});
			}
			const isCorrect = question.correct_answer === answer;
			const score = isCorrect ? question.point : 0;

			const submit = new this.submissionModel({
				question_id: createSubmissionDto.question_id,
				quiz_id: question.quiz_id,
				user_id,
				answer: answer,
				isCorrect,
				score,
			});

			await submit.save();

			return {
				isCorrect,
				score,
			};
		} catch (error) {
			throw new BadRequestException({
				status: HttpStatus.INTERNAL_SERVER_ERROR,
				error: error.message,
			});
		}
	}

	async findAll(
		searchPhase: string = '',
		page: number = 1,
		limit: number = 10,
		sortBy: string = 'createdAt',
		sortOrder: 'asc' | 'desc' = 'asc',
	): Promise<any> {
		try {
			const filter: any = {};
			if (searchPhase) {
				filter.$or = [
					{ name: new RegExp(searchPhase, 'i') },
					{ description: new RegExp(searchPhase, 'i') },
				];
			}

			const validPage = Number(page) > 0 ? Number(page) : 1;
			const validLimit = Number(limit) > 0 ? Number(limit) : 10;
			const skip = (validPage - 1) * validLimit;
			const sortDirection = sortOrder === 'asc' ? 1 : -1;

			const users = await this.submissionModel
				.find(filter)
				.skip(skip)
				.limit(limit)
				.sort({ [sortBy]: sortDirection })
				.populate('question_id')
				.populate('user_id')
				.exec();

			const totalItemCount = await this.submissionModel
				.countDocuments(filter)
				.exec();
			const totalPages =
				totalItemCount > 0 ? Math.ceil(totalItemCount / validLimit) : 1;
			const itemFrom = totalItemCount === 0 ? 0 : skip + 1;
			const itemTo = Math.min(skip + validLimit, totalItemCount);

			const response = {
				items: users,
				totalItemCount: totalItemCount,
				totalPages: totalPages,
				itemFrom: itemFrom,
				itemTo: itemTo,
			};

			return response;
		} catch (error) {
			throw new BadRequestException({
				status: HttpStatus.BAD_REQUEST,
				message:
					'Đã có lỗi xảy ra trong quá trình xem câu hỏi, vui lòng thử lại sau',
				details: `Đã có lỗi xảy ra: ${error.message}`,
			});
		}
	}

	async findOneByUserId(userId: string) {
		try {
			const userSubmission = await this.submissionModel.findOne({
				user_id: userId,
			});

			return userSubmission;
		} catch (error) {
			throw new BadRequestException({
				status: HttpStatus.BAD_REQUEST,
				message:
					'Đã có lỗi xảy ra trong quá trình xem câu hỏi, vui lòng thử lại sau',
				details: `Đã có lỗi xảy ra: ${error.message}`,
			});
		}
	}
}
