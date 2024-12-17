import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCitizenDto } from './dto/create-Citizen.dto';
import { UpdateCitizenDto } from './dto/update-Citizen.dto';
import { OrganizationsService } from '@modules/organizations/organizations.service';
import { FilterQuery } from 'mongoose';
import { Citizen } from './entities/Citizen.entity';
import { CitizensRepositoryInterface } from './interfaces/citizens.interfaces';
import { ERRORS_DICTIONARY } from 'src/constraints/error-dictionary.constraint';
import { StudentsRepositoryInterface } from '@modules/students/interfaces/students.interface';

@Injectable()
export class CitizensService {
	constructor(
		@Inject('CitizensRepositoryInterface')
		private readonly CitizensRepository: CitizensRepositoryInterface,
		private readonly organizationService: OrganizationsService,
		@Inject('StudentsRepositoryInterface')
		private readonly studentsRepository: StudentsRepositoryInterface, 
	  ) {}

	async setCurrentRefreshToken(_id: string, refreshToken: string): Promise<void> {
		try {
		  const Citizen = await this.CitizensRepository.findOneByCondition({ _id });
		  if (!Citizen) {
			throw new Error('User not found');
		  }
		  	Citizen.current_refresh_token = refreshToken;  
			await this.CitizensRepository.update(_id, { current_refresh_token: refreshToken }); 
		  	console.log(`Refresh token for user ${_id} has been updated.`);
		} catch (error) {
		  console.error(`Failed to set refresh token for user ${_id}:`, error);
		  throw new Error('Failed to set refresh token');
		}
	  }
	  async create(createDto: CreateCitizenDto): Promise<Citizen> {
		const { first_name, last_name, phone_number} = createDto;
		const [existed_phone_number_student, existed_phone_number_student_citizen] = await Promise.all([
			await this.studentsRepository.findOneByCondition({ phone_number }),
			await this.CitizensRepository.findOneByCondition({ phone_number })
		]);

		if (existed_phone_number_student || existed_phone_number_student_citizen) {
			throw new BadRequestException({
				message: ERRORS_DICTIONARY.STUDENT_PHONE_NUMBER_EXISTS,
				details: 'Phone number already exist',
			});
		}

		const citizen = await this.CitizensRepository.create({
			first_name,
			last_name,
			phone: phone_number,
		});
		return citizen;
	  }

	  async findAll() {
		return await this.CitizensRepository.findAll();
	  }

	async findOne(_id: string) {
		return await this.CitizensRepository.findOneByCondition({_id});
	}
	async findOneByCondition(condition: FilterQuery<Citizen>, action: string): Promise<Citizen | null> {
		const citizen = await this.CitizensRepository.findOneByCondition(condition);
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
		const updatedUser = await this.CitizensRepository.update(id,{...updateCitizenDto});
		if (!updatedUser) {
			throw new BadRequestException({
				message: ERRORS_DICTIONARY.CITIZEN_NOT_FOUND,
				details: 'citizen not found!!',
			});
		}
		return updatedUser;
	  }

	  async remove(id: string): Promise<void> {
		const result = await this.CitizensRepository.remove(id);
		if (!result) {
		  throw new NotFoundException(`Citizen with ID ${id} not found`);
		}
	  }

	async delete(id: string): Promise<Citizen> {
		return await this.CitizensRepository.update(id, {
		  deleted_at: new Date(),
		});
	}
}
