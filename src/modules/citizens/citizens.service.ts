import {
	BadRequestException,
	Inject,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { CreateCitizenDto } from './dto/create-citizen.dto';
import { UpdateCitizenDto } from './dto/update-citizen.dto';
import { OrganizationsService } from '@modules/organizations/organizations.service';
import { FilterQuery } from 'mongoose';
import { Citizen } from './entities/citizen.entity';
import { CitizensRepositoryInterface } from './interfaces/citizens.interfaces';
import { ERRORS_DICTIONARY } from 'src/constraints/error-dictionary.constraint';
import { StudentsRepositoryInterface } from '@modules/students/interfaces/students.interface';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class CitizensService {
	private readonly SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 10;
	constructor(
		@Inject('CitizensRepositoryInterface')
		private readonly citizensRepository: CitizensRepositoryInterface,
		private readonly organizationService: OrganizationsService,
		@Inject('StudentsRepositoryInterface')
		private readonly studentsRepository: StudentsRepositoryInterface,
	) {}

	async setCurrentRefreshToken(
		_id: string,
		refreshToken: string,
	): Promise<void> {
		try {
			const Citizen = await this.citizensRepository.findOneByCondition({ _id });
			if (!Citizen) {
				throw new Error('User not found');
			}
			Citizen.current_refresh_token = refreshToken;
			await this.citizensRepository.update(_id, {
				current_refresh_token: refreshToken,
			});
			console.log(`Refresh token for user ${_id} has been updated.`);
		} catch (error) {
			console.error(`Failed to set refresh token for user ${_id}:`, error);
			throw new Error('Failed to set refresh token');
		}
	}
	async create(createDto: CreateCitizenDto): Promise<Citizen> {
		const { first_name, last_name, phone_number, username, password, email } =
			createDto;

		const [existed_phone_number_student, existed_phone_number_student_citizen] =
			await Promise.all([
				await this.studentsRepository.findOneByCondition({ phone_number }),
				await this.citizensRepository.findOneByCondition({ phone_number }),
			]);
		const [existed_student_username, existed_citizen_username] =
			await Promise.all([
				await this.studentsRepository.findOneByCondition({ username }),
				await this.citizensRepository.findOneByCondition({ username }),
			]);

		if (existed_student_username || existed_citizen_username) {
			throw new BadRequestException({
				message: ERRORS_DICTIONARY.USERNAME_EXISTS,
				details: 'username đã tồn tại',
			});
		}

		if (
			phone_number &&
			(existed_phone_number_student || existed_phone_number_student_citizen)
		) {
			throw new BadRequestException({
				message: ERRORS_DICTIONARY.CITIZEN_PHONE_NUMBER_EXISTS,
				details: 'Phone number already exist',
			});
		}
		const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);

		const citizen = await this.citizensRepository.create({
			first_name,
			last_name,
			phone_number,
			username,
			password: hashedPassword,
			email,
		});
		return citizen;
	}

	async findAll() {
		return await this.citizensRepository.findAll();
	}

	async findOne(_id: string) {
		return await this.citizensRepository.findOneByCondition({ _id });
	}
	async findOneByCondition(
		condition: FilterQuery<Citizen>,
		action: string,
	): Promise<Citizen | null> {
		const citizen = await this.citizensRepository.findOneByCondition(condition);
		if (!citizen) {
			if (action === 'sign-up' || action === 'sign-in') {
				return citizen;
			} else {
				throw new BadRequestException({
					message: ERRORS_DICTIONARY.CITIZEN_NOT_FOUND,
					details: 'citizen not found!!',
				});
			}
		}
		return citizen;
	}

	async update(
		id: string,
		updateCitizenDto: UpdateCitizenDto,
	): Promise<Citizen> {
		const updatedUser = await this.citizensRepository.update(id, {
			...updateCitizenDto,
		});
		if (!updatedUser) {
			throw new BadRequestException({
				message: ERRORS_DICTIONARY.CITIZEN_NOT_FOUND,
				details: 'citizen not found!!',
			});
		}
		return updatedUser;
	}

	async remove(id: string): Promise<void> {
		const result = await this.citizensRepository.remove(id);
		if (!result) {
			throw new NotFoundException(`Citizen with ID ${id} not found`);
		}
	}

	async delete(id: string): Promise<Citizen> {
		return await this.citizensRepository.update(id, {
			deleted_at: new Date(),
			isActive: false,
		});
	}

	async setIsActiveTrue(id: string): Promise<Citizen> {
		return await this.citizensRepository.update(id, {
			isActive: true,
		});
	}
}
