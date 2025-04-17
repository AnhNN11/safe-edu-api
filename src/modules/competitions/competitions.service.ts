import {
	BadRequestException,
	HttpStatus,
	Inject,
	Injectable,
} from '@nestjs/common';
import { CreateCompetitionDto } from './dto/create-competition.dto';
import { UpdateCompetitionDto } from './dto/update-competition.dto';
import { CompetitionsRepository } from '@repositories/competition.repository';
import { ObjectId, Types } from 'mongoose';
import { Competition } from './entities/competition.entity';
import { ERRORS_DICTIONARY } from 'src/constraints/error-dictionary.constraint';

@Injectable()
export class CompetitionsService {
	constructor(
		@Inject('CompetitionsRepositoryInterface')
		private readonly competition_repository: CompetitionsRepository,
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
}
