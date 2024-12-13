import { Inject, Injectable } from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentsRepositoryInterface } from './interfaces/students.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StudentsService {
	constructor(
		@Inject('StudentsRepositoryInterface')
		private readonly studentRepository: StudentsRepositoryInterface,
		private readonly configService: ConfigService,
	) {}
	create(createStudentDto: CreateStudentDto) {
		return 'This action adds a new student';
	}

	findAll() {
		return `This action returns all students`;
	}

	findOne(id: string) {
		return `This action returns a #${id} student`;
	}
	findOneByCondition(arg0: { phone_number: string }) {
		throw new Error('Method not implemented.');
	}

	update(id: number, updateStudentDto: UpdateStudentDto) {
		return `This action updates a #${id} student`;
	}

	remove(id: number) {
		return `This action removes a #${id} student`;
	}
}
