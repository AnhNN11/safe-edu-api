import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentsRepositoryInterface } from './interfaces/students.interface';
import { OrganizationsService } from '@modules/organizations/organizations.service';
import { FilterQuery } from 'mongoose';
import { Student } from './entities/student.entity';

@Injectable()
export class StudentsService {
	constructor(
		@Inject('StudentsRepositoryInterface')
		private readonly studentsRepository: StudentsRepositoryInterface,
		private readonly organizationService: OrganizationsService, 
	  ) {}

	async setCurrentRefreshToken(_id: string, refreshToken: string): Promise<void> {
		try {
		  const student = await this.studentsRepository.findOneByCondition({ _id });
		  if (!student) {
			throw new Error('User not found');
		  }
		  	student.current_refresh_token = refreshToken;  
			await this.studentsRepository.update(_id, { current_refresh_token: refreshToken }); 
		  	console.log(`Refresh token for user ${_id} has been updated.`);
		} catch (error) {
		  console.error(`Failed to set refresh token for user ${_id}:`, error);
		  throw new Error('Failed to set refresh token');
		}
	  }
	  async create(createDto: CreateStudentDto): Promise<Student> {
		const { first_name, last_name, phone_number, password, organizationId } = createDto;
		const student = await this.studentsRepository.create({
			first_name,
			last_name,
			phone_number,
			password,
			organizationId
		});
		return student;
	  }

	  async findAll() {
		return await this.studentsRepository.findAll();
	  }

	async findOne(_id: string) {
		return await this.studentsRepository.findOneByCondition({_id});
	}
	async findOneByCondition(condition: FilterQuery<Student>): Promise<Student | null> {
		return this.studentsRepository.findOneByCondition(condition);
	}

	async update(
		id: string,
		updateStudentDto: UpdateStudentDto,
	  ): Promise<Student> {
		const updatedUser = await this.studentsRepository.update(id,{...updateStudentDto});
		if (!updatedUser) {
		  throw new NotFoundException(`Student with ID ${id} not found`);
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
		});
	}

}
