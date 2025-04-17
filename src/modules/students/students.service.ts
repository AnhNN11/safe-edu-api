import {
	BadRequestException,
	Inject,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentsRepositoryInterface } from './interfaces/students.interface';
import { OrganizationsService } from '@modules/organizations/organizations.service';
import mongoose, { FilterQuery } from 'mongoose';
import { Student } from './entities/student.entity';
import { ERRORS_DICTIONARY } from 'src/constraints/error-dictionary.constraint';
import { CitizensRepositoryInterface } from '@modules/citizens/interfaces/citizens.interfaces';
import * as bcrypt from 'bcryptjs';
@Injectable()
export class StudentsService {
	private readonly SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 10;
	constructor(
		@Inject('StudentsRepositoryInterface')
		private readonly studentsRepository: StudentsRepositoryInterface,
		private readonly organizationService: OrganizationsService,
		@Inject('CitizensRepositoryInterface')
		private readonly citizenRepository: CitizensRepositoryInterface,
	) {}

	async setCurrentRefreshToken(
		_id: string,
		refreshToken: string,
	): Promise<void> {
		try {
			const student = await this.studentsRepository.findOneByCondition({ _id });
			if (!student) {
				throw new Error('User not found');
			}
			student.current_refresh_token = refreshToken;
			await this.studentsRepository.update(_id, {
				current_refresh_token: refreshToken,
			});
			console.log(`Refresh token for user ${_id} has been updated.`);
		} catch (error) {
			console.error(`Failed to set refresh token for user ${_id}:`, error);
			throw new Error('Failed to set refresh token');
		}
	}
	async create(createDto: CreateStudentDto): Promise<Student> {
		const {
			first_name,
			last_name,
			phone_number,
			date_of_birth,
			organizationId,
			password,
			username,
			email,
		} = createDto;
		const existed_organization =
			await this.organizationService.findOneById(organizationId);

		const [existed_phone_number_student, existed_phone_number_student_citizen] =
			await Promise.all([
				await this.studentsRepository.findOneByCondition({ phone_number }),
				await this.citizenRepository.findOneByCondition({ phone_number }),
			]);

		const [existed_student_username, existed_citizen_username] =
			await Promise.all([
				await this.studentsRepository.findOneByCondition({ username }),
				await this.citizenRepository.findOneByCondition({ username }),
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
				message: ERRORS_DICTIONARY.STUDENT_PHONE_NUMBER_EXISTS,
				details: 'Phone number already exist',
			});
		}

		if (!existed_organization) {
			throw new BadRequestException({
				message: ERRORS_DICTIONARY.ORGANIZATION_NAME_NOT_FOUND,
				details: 'Organization not found!!',
			});
		}
		const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);

		const student = await this.studentsRepository.create({
			first_name,
			last_name,
			date_of_birth,
			username,
			phone_number,
			password: hashedPassword,
			email,
			organizationId: new mongoose.Types.ObjectId(organizationId),
		});
		return student;
	}

	async findAll() {
		return await this.studentsRepository.findAll();
	}

	async findOne(_id: string) {
		return await this.studentsRepository.findOneByCondition({ _id });
	}
	async findOneByCondition(
		condition: FilterQuery<Student>,
		action: string,
	): Promise<Student | null> {
		const student = await this.studentsRepository.findOneByCondition(condition);
		if (!student) {
			if (action === 'sign-up') {
				return student;
			} else if (action === 'sign-in') {
				return student;
			} else {
				throw new BadRequestException({
					message: ERRORS_DICTIONARY.STUDENT_NOT_FOUND,
					details: 'Student not found!!',
				});
			}
		}

		return student;
	}

	async update(
		id: string,
		updateStudentDto: UpdateStudentDto,
	): Promise<Student> {
		if (updateStudentDto.organizationId) {
			if (!mongoose.Types.ObjectId.isValid(updateStudentDto.organizationId)) {
				throw new BadRequestException({
					message: 'Invalid organization ID format',
					details: 'Organization ID must be a valid ObjectId',
				});
			}
			updateStudentDto.organizationId = new mongoose.Types.ObjectId(
				updateStudentDto.organizationId,
			) as any;
		}
		const updatedUser = await this.studentsRepository.update(id, {
			...updateStudentDto,
			organizationId: updateStudentDto.organizationId
				? new mongoose.Types.ObjectId(updateStudentDto.organizationId)
				: undefined,
		});
		if (!updatedUser) {
			throw new BadRequestException({
				message: ERRORS_DICTIONARY.STUDENT_NOT_FOUND,
				details: 'Student not found!!',
			});
		}
		return updatedUser;
	}

	async remove(id: string): Promise<void> {
		const result = await this.studentsRepository.remove(id);
		if (!result) {
			throw new NotFoundException(`Student with ID ${id} not found`);
		}
	}

	async delete(id: string): Promise<Student> {
		return await this.studentsRepository.update(id, {
			deleted_at: new Date(),
			isActive: false,
		});
	}

	async setIsActiveTrue(id: string): Promise<Student> {
		return await this.studentsRepository.update(id, {
			isActive: true,
		});
	}
}
