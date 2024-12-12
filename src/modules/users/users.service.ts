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
import { OrganizationsService } from '@modules/organizations/organizations.service';
  
  @Injectable()
  export class UsersService {
	constructor(
	  @Inject('UsersRepositoryInterface')
	  private readonly usersRepository: UsersRepositoryInterface,
	  private readonly userRolesService: UserRolesService, 
	  private readonly configService: ConfigService,
	  private readonly organizationService: OrganizationsService,
	) {}
	
	async setCurrentRefreshToken(userId: string, refreshToken: string): Promise<void> {
		try {
		  // Tìm người dùng theo ID
		  const user = await this.usersRepository.findById(userId);
		  
		  if (!user) {
			throw new Error('User not found');
		  }
	
		  // Cập nhật refresh token cho người dùng
		  user.refreshToken = refreshToken;  // Giả sử `refreshToken` là trường trong entity User
		//  await this.usersRepository.update(userId, { token: refreshToken });  // Cập nhật thông tin trong DB
	
		  console.log(`Refresh token for user ${userId} has been updated.`);
		} catch (error) {
		  console.error(`Failed to set refresh token for user ${userId}:`, error);
		  throw new Error('Failed to set refresh token');
		}
	  }
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
  
	async setCurrentRefreshToken(
		id: string,
		hashed_token: string,
	): Promise<void> {
		try {
			await this.usersRepository.update(id, {
				current_refresh_token: hashed_token,
			});
		} catch (error) {
			throw error;
		}
	}

	async create(createDto: CreateUserDto): Promise<User> {
		console.log('service');
		
		
		const role = await this.userRolesService.findOne(createDto.role);
		const organization = await this.organizationService.findOneById(createDto.organizationId);
		console.log('findOne='+typeof(role.name));

		if (!role) {
		  throw new BadRequestException('Role not found');
		}
		console.log('role='+role.name);
		if(organization) {
			const user = await this.usersRepository.create({
				...createDto,
				role: role.id,
				organizationId: organization.id
			})
			return user;
		} else {
			const user = await this.usersRepository.create({
				...createDto,
				role: role.id,
			  });
			  return user;
		}
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
  