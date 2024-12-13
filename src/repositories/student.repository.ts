import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Student } from '@modules/Students/entities/Student.entity';
import { StudentsRepositoryInterface } from '@modules/students/interfaces/students.interface';

@Injectable()
export class StudentsRepository implements StudentsRepositoryInterface {
	constructor(
		@InjectModel(Student.name) private readonly StudentModel: Model<Student>,
	) {}
	async findOne(condition: FilterQuery<Student>): Promise<Student | null> {
		return await this.StudentModel.findOne(condition).exec(); 
	  }
	async create(data: Partial<Student>): Promise<Student> {
		console.log('data:', JSON.stringify(data, null, 2));
		
		try {
			const newStudent = new this.StudentModel(data);
			const savedStudent = await newStudent.save();
			return savedStudent;
		  } catch (error) {
			console.error('Error saving new Student:', error.message);
		  
			// Tùy chỉnh lỗi phản hồi
			throw new BadRequestException('Failed to create Student. Please try again.');
		  }
	}
	async findAll() {
		const Students = await this.StudentModel
		  .find()
		  .populate('role')
		  .exec(); 
	  
		const total = await this.StudentModel.countDocuments().exec();
		return { items: Students, total };
	  }
	  
	  

	async getStudentWithRole(StudentId: string): Promise<Student | null> {
		return await this.StudentModel.findById(StudentId).populate('role').exec();
	}

	async update(id: string, data: Partial<Student>): Promise<Student | null> {
		return await this.StudentModel.findByIdAndUpdate(id, data, { new: true }).exec();
	}

	async remove(id: string): Promise<boolean> {
		const result = await this.StudentModel.findByIdAndDelete(id).exec();
		return !!result;
	}

	async findById(id: string): Promise<Student | null> {
		return await this.StudentModel.findById(id).exec(); // Using Mongoose's findById method
	  }
}
