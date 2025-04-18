import {
	BadRequestException,
	HttpStatus,
	Inject,
	Injectable,
} from '@nestjs/common';
import { CreateCompetitionDto } from './dto/create-competition.dto';
import { UpdateCompetitionDto } from './dto/update-competition.dto';
import { CompetitionsRepository } from '@repositories/competition.repository';
import { Model, ObjectId, Types } from 'mongoose';
import { Competition } from './entities/competition.entity';
import { ERRORS_DICTIONARY } from 'src/constraints/error-dictionary.constraint';
import { QuizResultService } from '@modules/quiz-result/quiz-result.service';
import { Quiz } from '@modules/quiz/entities/quiz.entity';
import { InjectModel } from '@nestjs/mongoose';
import { QuizService } from '@modules/quiz/quiz.service';
import { Hash } from 'crypto';
import { QuizResult } from '@modules/quiz-result/entities/quiz-result.entity';
import { StudentsService } from '@modules/students/students.service';
import { CitizensService } from '@modules/citizens/citizens.service';

@Injectable()
export class CompetitionsService {
	constructor(
		@Inject('CompetitionsRepositoryInterface')
		private readonly competition_repository: CompetitionsRepository,
		private readonly quizResultService: QuizResultService,
		private readonly quizService: QuizService,
		private readonly student_service: StudentsService,
		private readonly citizen_service: CitizensService,
	) {}

	async create(
		createCompetitionDto: CreateCompetitionDto,
	): Promise<Competition> {
		try {
			const { title, description, startDate, endDate } = createCompetitionDto;
			const existed_competition = await this.competition_repository.findOne({
				title,
			});

			if (existed_competition) {
				throw new BadRequestException({
					message: ERRORS_DICTIONARY.COMPETITION_IS_EXIST,
					details: 'Competition already exist',
				});
			}

			if (endDate.getTime < startDate.getTime) {
				throw new BadRequestException({
					message: ERRORS_DICTIONARY.INVALID_END_DATE,
					details: 'Ngày bắt đầu phải bé hơn ngày kết thúc',
				});
			}

			const competition = await this.competition_repository.create({
				...createCompetitionDto,
				// created_by: requestId,
			});

			return this.competition_repository.findOne(competition);
		} catch (error) {
			throw new BadRequestException({
				status: HttpStatus.BAD_REQUEST,
				message: 'Đã có lỗi xảy ra khi tạo cuộc thi, vui lòng thử lại sau',
				details: `Có lỗi xảy ra khi tạo cuộc thi: ${error}`,
			});
		}
	}

	async findAll(
		searchPhase?: string,
		page?: number,
		limit?: number,
		sortBy?: string,
		sortOrder?: 'asc' | 'desc',
	) {
		return await this.competition_repository.findAll(
			searchPhase,
			Number(page),
			Number(limit),
			sortBy,
			sortOrder,
		);
	}

	async findById(id: string) {
		return await this.competition_repository.findById(id);
	}

	async update(
		id: string,
		updateCompetitionDto: UpdateCompetitionDto,
	): Promise<Competition> {
		try {
			const updated_competition = await this.competition_repository.update(id, {
				...updateCompetitionDto,
			});

			return await this.competition_repository.findOne(updated_competition);
		} catch (error) {
			throw new BadRequestException({
				status: HttpStatus.BAD_REQUEST,
				message: 'Đã có lỗi xảy ra trong lúc cập nhật, vui lòng thử lại sau',
				details: `Đã có lỗi xảy ra: ${error.message}`,
			});
		}
	}

	async remove(id: string | Types.ObjectId): Promise<Competition | null> {
		try {
			return await this.competition_repository.remove(id);
		} catch (error) {
			throw new BadRequestException({
				status: HttpStatus.BAD_REQUEST,
				message:
					'Đã có lỗi xảy ra trong lúc xóa cuộc thi, vui lòng thử lại sau',
				details: `Đã có lỗi xảy ra: ${error.message}`,
			});
		}
	}

	async findBySlug(slug: string): Promise<Competition> {
		try {
			const competition = await this.competition_repository.findBySlug(slug);
			console.log('competition', competition);
			return competition;
		} catch (error) {
			throw new BadRequestException({
				status: HttpStatus.BAD_REQUEST,
				message:
					'Đã có lỗi xảy ra trong lúc tìm kiếm mã định danh, vui lòng thử lại sau',
				details: `Đã có lỗi xảy ra: ${error.message}`,
			});
		}
	}
	async findleaderBoadBySlug(slug: string) {
		try {
			const competition = await this.competition_repository.findBySlug(slug);
			console.log('competition._id', competition._id);
			const { data: quizs } = await this.quizService.getAllByCompetitionId(
				competition._id.toString(),
			);
			const quiz_results = await Promise.all(
				quizs?.map(async (quiz: Quiz) => {
					return await this.quizResultService.findOneByQuizId(
						quiz._id.toString(),
					);
				}) || [],
			).then((data) => data?.flat());

			const leaderBoard = {};

			quiz_results?.forEach((quiz_result: QuizResult) => {
				const { score } = quiz_result;
				const user_id = quiz_result.user_id.toString();
				if (!leaderBoard[user_id]) {
					leaderBoard[user_id] = {
						user_id,
						score: score || 0,
					};
				} else
					leaderBoard[user_id].score = leaderBoard[user_id].score + score || 0;
			});

			const leader_board_array = Object.values(leaderBoard).sort(
				(a: { score: number }, b: { score: number }) => b?.score - a?.score,
			);

			const leader_board_info = await Promise.all(
				leader_board_array.map(
					async (item: { user_id: string; score: number }) => {
						console.log('item', item);
						const { user_id, score } = item;

						const [existed_student_user, existed_citizen_user] =
							await Promise.all([
								await this.student_service.findOneByCondition(
									{ _id: user_id },
									'sign-in',
								),
								await this.citizen_service.findOneByCondition(
									{ _id: user_id },
									'sign-in',
								),
							]);

						if (existed_student_user) {
							return {
								user: existed_student_user,
								score,
							};
						}
						if (existed_citizen_user) {
							return {
								user: existed_citizen_user,
								score,
							};
						}
						new Error(
							'Không tìm thấy người dùng trong danh sách sinh viên hoặc công dân',
						);
					},
				),
			);

			return leader_board_info;
		} catch (error) {
			throw new BadRequestException({
				status: HttpStatus.BAD_REQUEST,
				message:
					'Đã có lỗi xảy ra trong lúc tìm kiếm mã định danh, vui lòng thử lại sau',
				details: `Đã có lỗi xảy ra: ${error.message}`,
			});
		}
	}
	async getAllBySlug(slug: string) {
		try {
			const competition = await this.competition_repository.findBySlug(slug);
			const quiz = await this.quizService.getAllByCompetitionId(
				competition._id.toString(),
			);

			return {
				...quiz,
			};
		} catch (error) {
			throw new BadRequestException({
				status: HttpStatus.BAD_REQUEST,
				message: 'Đã có lỗi xảy ra khi lấy câu hỏi theo cuộc thi',
				details: `Lỗi: ${error.message}`,
			});
		}
	}
}
