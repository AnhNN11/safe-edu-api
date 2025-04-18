import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Submission } from '@modules/submission/entities/submission.entity';
import { QuizResult } from './entities/quiz-result.entity';
import { QuestionsService } from '@modules/questions/questions.service';

@Injectable()
export class QuizResultService {
	constructor(
		@InjectModel(QuizResult.name)
		private readonly quizResultModel: Model<QuizResult>,
		@InjectModel(Submission.name)
		private readonly answerModel: Model<Submission>,
		private readonly questionsService: QuestionsService,
	) {}

	async calculateQuizResult(quiz_id: string, user_id: string) {
		const isSubmited = await this.quizResultModel
			.findOne({ quiz_id, user_id })
			.populate('quiz_id')
			.populate('user_id')
			.exec();
		if (isSubmited) {
			const answers = await this.answerModel
				.find({ user_id, quiz_id })
				.populate('question_id')
				.exec();
			return {
				...isSubmited.toObject(),
				questions: answers,
			};
		} else {
			return await this.calculate(user_id, quiz_id);
		}
	}

	async isDoQuiz(
		quizId: string,
		userId: string,
	): Promise<{ isSubmit: boolean }> {
		try {
			const submission = await this.quizResultModel.exists({
				user_id: userId,
				quiz_id: quizId,
			});

			return { isSubmit: !!submission };
		} catch (error) {
			throw new BadRequestException({
				status: HttpStatus.INTERNAL_SERVER_ERROR,
				error: 'Server error',
			});
		}
	}

	async calculate(user_id: string, quiz_id: string): Promise<any> {
		const answers = await this.answerModel
			.find({ user_id, quiz_id })
			.populate('question_id')
			.populate('quiz_id')
			.populate('user_id')
			.exec();
		const score = answers.reduce((sum, a) => sum + a.score, 0);
		console.log('answers', answers);
		if (!answers.length) {
			throw new BadRequestException({
				status: HttpStatus.BAD_REQUEST,
				message: 'Bạn chưa làm bài thi này',
				details: 'Bạn chưa làm bài thi này',
			});
		}

		const questions = await this.questionsService.getAllByQuizId(quiz_id);
		const totalScore = questions.data.reduce((sum, q) => sum + q.point, 0);
		const result = new this.quizResultModel({
			quiz_id,
			user_id,
			score: (score / totalScore) * 10,
			completedAt: new Date(),
		});

		await result.save();
		return { ...result.toObject(), questions: answers };
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

			const users = await this.quizResultModel
				.find(filter)
				.skip(skip)
				.limit(limit)
				.sort({ [sortBy]: sortDirection })
				.populate('quiz_id')
				.populate('user_id')
				.exec();

			const totalItemCount = await this.quizResultModel
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

	async findOneByQuizId(quiz_id: string): Promise<any> {
		try {
			const quizResult = await this.quizResultModel
				.find({ quiz_id })
				.populate('quiz_id')
				.exec();
			return quizResult;
		} catch (error) {
			throw new BadRequestException({
				status: HttpStatus.BAD_REQUEST,
				message: 'Đã có lỗi xảy ra trong lúc tìm kiếm, vui lòng thử lại sau',
				details: `Đã có lỗi xảy ra: ${error.message}`,
			});
		}
	}

	findOne(id: number) {
		return `This action returns a #${id} quizResult`;
	}
}
