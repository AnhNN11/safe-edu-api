import {
	BadRequestException,
	Inject,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';
import { UsersRepositoryInterface } from './interfaces/users.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { USER_ROLE } from '@modules/user-roles/entities/user-role.entity';
import { UserRolesService } from '@modules/user-roles/user-roles.service';
import { FindAllResponse, QueryParams } from 'src/types/common.type';
import { FilterQuery } from 'mongoose';

@Injectable()
export class UsersService {
	constructor(
		@Inject('UsersRepositoryInterface')
		private readonly usersRepository: UsersRepositoryInterface,
		private readonly userRolesService: UserRolesService,
		private readonly configService: ConfigService,
	) {}


	async findOneByCondition(condition: FilterQuery<User>): Promise<User | null> {
		return this.usersRepository.findOne(condition);
	}
	async create(createDto: CreateUserDto): Promise<User> {
		try {
			return await this.usersRepository.create({
				...createDto,
				// role: userRole,
			});
		} catch (error) {
			throw new BadRequestException('Error creating user');
		}
	}

	async findAll() {
		return await this.usersRepository.findAll(
			
		);
	}
	
	async update(
		id: string,
		updateUserDto: UpdateUserDto,
	): Promise<User> {
		const updatedUser = await this.usersRepository.update(id, updateUserDto);
		if (!updatedUser) {
			throw new NotFoundException(`User with ID ${id} not found`);
		}
		return updatedUser;
	}

	async remove(id: string): Promise<void> {
		const result = await this.usersRepository.remove(id);
		if (!result) {
			throw new NotFoundException(`User with ID ${id} not found`);
		}
	}
	async getUserByEmail(email: string): Promise<User> {
		const user = await this.usersRepository.findOne({ email });
		if (!user) {
			throw new NotFoundException(`User with email ${email} not found`);
		}
		return user;
	}

	async getUserWithRole(user_id: string): Promise<User> {
		const user = await this.usersRepository.getUserWithRole(user_id);
		if (!user) {
			throw new NotFoundException(`User with ID ${user_id} not found`);
		}
		return user;
	}

	async setCurrentRefreshToken(
		id: string,
		hashed_token: string,
	): Promise<void> {
		const user = await this.usersRepository.findById(id);
		if (!user) {
			throw new NotFoundException(`User with ID ${id} not found`);
		}

		await this.usersRepository.update(id, {
			current_refresh_token: hashed_token,
		});
	}

}
