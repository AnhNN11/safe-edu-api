import {
	BadRequestException,
	Inject,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { FindAllResponse, QueryParams } from 'src/types/common.type';
import { FilterQuery } from 'mongoose';
import { log } from 'console';
import { Admin } from './entities/admin.entity';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AdminRepositoryInterface } from './interfaces/admin.interface';
import { ERRORS_DICTIONARY } from 'src/constraints/error-dictionary.constraint';

@Injectable()
export class AdminService {
	constructor(
		@Inject('AdminRepositoryInterface')
		private readonly adminRepository: AdminRepositoryInterface,
		// private readonly configService: ConfigService,
	) { }

	async setCurrentRefreshToken(
		adminId: string,
		refreshToken: string,
	): Promise<void> {
		try {
			// Tìm người dùng theo ID
			const admin = await this.adminRepository.findById(adminId);

			if (!admin) {
				throw new Error('admin not found');
			}

			// Cập nhật refresh token cho người dùng
			admin.refreshToken = refreshToken; // Giả sử `refreshToken` là trường trong entity User
			//  await this.usersRepository.update(userId, { token: refreshToken });  // Cập nhật thông tin trong DB

			console.log(`Refresh token for user ${adminId} has been updated.`);
		} catch (error) {
			console.error(`Failed to set refresh token for user ${adminId}:`, error);
			throw new Error('Failed to set refresh token');
		}
	}
	// Method to find a user by condition
	async findOneByCondition(
		condition: FilterQuery<Admin>,
	): Promise<Admin | null> {
		console.log('Condition:', condition);
		const result = await this.adminRepository.findOne(condition);
		console.log('Result:', result);
		if (!result) {
			throw new NotFoundException(`Admin with ID ${condition} not found`);
		}
		return result;
	}


	async findOneById(
		adminId: string,
	): Promise<Admin | null> {

		const admin = await this.adminRepository.findById(adminId);
		console.log('Result:', admin);
		if (!admin) {
			throw new NotFoundException(`Admin with ID ${adminId} not found`);
		}
		return admin;
	}
	//

	async create(createDto: CreateAdminDto): Promise<Admin> {
		console.log('service');
		const {email, phone_number} = createDto;
		const exsited_email = await this.adminRepository.findOne({ email });
		const existed_phone_number = await this.adminRepository.findOne({ phone_number })
		if(existed_phone_number) {
			console.log("123" + existed_phone_number);
			throw new BadRequestException({
				message: ERRORS_DICTIONARY.ADMIN_PHONE_NUMBER_IS_EXIST,
				details: 'Phone number already exist',
			});
		}

		if(exsited_email) {
			console.log(exsited_email);
			throw new BadRequestException({
				message: ERRORS_DICTIONARY.ADMIN_EMAIL_IS_EXIST,
				details: 'Email already exist',
			});
		}

		const admin = await this.adminRepository.create({
			...createDto,
		});

		return admin;
	}

	async findAll() {
		return await this.adminRepository.findAll();
	}

	async update(id: string, updateUserDto: UpdateAdminDto): Promise<Admin> {
		const updatedAdmin = await this.adminRepository.update(id, {
			...updateUserDto,
		});
		if (!updatedAdmin) {
			throw new NotFoundException(`Admin with ID ${id} not found`);
		}
		return updatedAdmin;
	}

	async getAdminByEmail(email: string): Promise<Admin> {
		const admin = await this.adminRepository.findOne({ email });

		if (!admin) {
			throw new NotFoundException(`admin with email ${email} not found`);
		}

		return admin;
	}

	async delete(id: string): Promise<Admin> {
		await this.adminRepository.update(id, {
			deleted_at: new Date(),
			isActive: false,
		});
	
		// Truy vấn lại để lấy bản ghi đã cập nhật
		const admin = await this.adminRepository.findOne({ id });
		
	
		return admin;
	}
	

	async setActiveIsTrue(id: string): Promise<Admin> {
		// Cập nhật trường isActive thành true
		const admin = await this.adminRepository.update(id,
			{ isActive: true }, 
		);
		return admin;
	  }
}
