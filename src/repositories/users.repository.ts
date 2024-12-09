import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { User } from '@modules/users/entities/user.entity';
import { UsersRepositoryInterface } from '@modules/users/interfaces/users.interface';

@Injectable()
export class UsersRepository implements UsersRepositoryInterface {
	constructor(
		@InjectModel(User.name) private readonly userModel: Model<User>,
	) {}
	async findOne(condition: FilterQuery<User>): Promise<User | null> {
		return await this.userModel.findOne(condition).exec(); 
	  }
	async create(data: Partial<User>): Promise<User> {
		console.log('data:', JSON.stringify(data, null, 2));
		
		try {
			const newUser = new this.userModel(data);
			const savedUser = await newUser.save();
			return savedUser;
		  } catch (error) {
			console.error('Error saving new user:', error.message);
		  
			// Tùy chỉnh lỗi phản hồi
			throw new BadRequestException('Failed to create user. Please try again.');
		  }
	}
	async findAll() {
		const users = await this.userModel
		  .find()
		  .populate('role')
		  .exec(); 
	  
		const total = await this.userModel.countDocuments().exec();
		return { items: users, total };
	  }
	  
	  

	async getUserWithRole(userId: string): Promise<User | null> {
		return await this.userModel.findById(userId).populate('role').exec();
	}

	async update(id: string, data: Partial<User>): Promise<User | null> {
		return await this.userModel.findByIdAndUpdate(id, data, { new: true }).exec();
	}

	async remove(id: string): Promise<boolean> {
		const result = await this.userModel.findByIdAndDelete(id).exec();
		return !!result;
	}

	async findById(id: string): Promise<User | null> {
		return await this.userModel.findById(id).exec(); // Using Mongoose's findById method
	  }
}
