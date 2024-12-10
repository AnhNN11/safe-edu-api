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
  import { USER_ROLE, UserRole } from '@modules/user-roles/entities/user-role.entity';
  import { UserRolesService } from '@modules/user-roles/user-roles.service';
  import { FindAllResponse, QueryParams } from 'src/types/common.type';
  import { FilterQuery } from 'mongoose';
import { log } from 'console';
  
  @Injectable()
  export class UsersService {
	setCurrentRefreshToken(user_id: string, hashed_token: any) {
		throw new Error('Method not implemented.');
	}
	constructor(
	  @Inject('UsersRepositoryInterface')
	  private readonly usersRepository: UsersRepositoryInterface,
	  private readonly userRolesService: UserRolesService, 
	  private readonly configService: ConfigService,
	) {}
  
	// Method to find a user by condition
	async findOneByCondition(condition: FilterQuery<User>): Promise<User | null> {
	  return this.usersRepository.findOne(condition);
	}
  
	// Corrected findOneById for finding roles
	async findOneById(roleId: string): Promise<UserRole> {
	  const role = await this.userRolesService.findOne(roleId); // Use UserRolesService to find the role
	  if (!role) {
		throw new BadRequestException('Role not found');
	  }
	  return role;
	}
  
	
	async create(createDto: CreateUserDto): Promise<User> {
		console.log('service');
		
		
		const role = await this.userRolesService.findOne(createDto.role);
		console.log('findOne='+typeof(role.name));
		
		if (!role) {
		  throw new BadRequestException('Role not found');
		}
		console.log('role='+role.name);
		 const user = await this.usersRepository.create({
		   ...createDto,
		   role: role.id,
		 });
	  
		 return user;
	  }
	// Find all users
	async findAll() {
	  return await this.usersRepository.findAll();
	}
  
	// Get user with their role
	async getUserWithRole(userId: string): Promise<User> {
		
	  const user = await this.usersRepository.getUserWithRole(userId);
	  if (!user) {
		throw new NotFoundException(`User with ID ${userId} not found`);
	  }
	  return user;
	}
  

	// Update user
	async update(
	  id: string,
	  updateUserDto: UpdateUserDto,
	): Promise<User> {
	  const role = await this.findOneById(updateUserDto.role);
	  const updatedUser = await this.usersRepository.update(id,{...updateUserDto, role:role.id});
	  if (!updatedUser) {
		throw new NotFoundException(`User with ID ${id} not found`);
	  }
	  return updatedUser;
	}
  
	// Remove user
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
  }
  