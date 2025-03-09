import {
    BadRequestException,
    Inject,
    Injectable,
    NotFoundException,
  } from '@nestjs/common';
  import { ConfigService } from '@nestjs/config';

  import { FindAllResponse, QueryParams } from 'src/types/common.type';
  import mongoose, { FilterQuery } from 'mongoose';
import { log } from 'console';
import { Manager } from './entities/manager.entity';
import { CreateManagerDto } from './dto/create-manager.dto';
import { UpdateManagerDto } from './dto/update-manager.dto';
import { ManagerRepositoryInterface } from './interfaces/manager.interface';
import { ERRORS_DICTIONARY } from 'src/constraints/error-dictionary.constraint';
import { OrganizationsService } from '@modules/organizations/organizations.service';

  
  @Injectable()
  export class ManagerService {
    constructor(
      @Inject('ManagerRepositoryInterface')
      private readonly ManagerRepository: ManagerRepositoryInterface,
      private readonly configService: ConfigService,
      private readonly organizationService: OrganizationsService,
    ) {}

      
    async setCurrentRefreshToken(managerId: string, refreshToken: string): Promise<void> {
        try {
          // Tìm người dùng theo ID
          const Manager = await this.ManagerRepository.findById(managerId);
          
          if (!Manager) {
            throw new Error('Manager not found');
          }
    
          // Cập nhật refresh token cho người dùng
          Manager.refreshToken = refreshToken;  // Giả sử `refreshToken` là trường trong entity User
        //  await this.usersRepository.update(userId, { token: refreshToken });  // Cập nhật thông tin trong DB
    
          console.log(`Refresh token for user ${managerId} has been updated.`);
        } catch (error) {
          console.error(`Failed to set refresh token for user ${managerId}:`, error);
          throw new Error('Failed to set refresh token');
        }
      }

    async findOneByCondition(condition: FilterQuery<Manager>): Promise<Manager | null> {
      return await this.ManagerRepository.findOne(condition);
    }
  
    async findOneById(
        managerId: string,
      ): Promise<Manager | null> {
    
        const manager = await this.ManagerRepository.findById(managerId);
        if (!manager) {
          throw new NotFoundException(`Admin with ID ${managerId} not found`);
        }
        return manager;
      }

    async create(createDto: CreateManagerDto): Promise<Manager> {
    const { first_name, last_name,email, phone_number, organizationId } = createDto;
    const existed_organization = await this.organizationService.findOneById(organizationId)
    console.log(existed_organization);

    const manager = await this.ManagerRepository.create({
      first_name,
      last_name,
      email,
      phone_number,
      organizationId: new mongoose.Types.ObjectId(organizationId)
    });
      return this.ManagerRepository.findOne(manager);
    }
 
    async findAll() {
      return await this.ManagerRepository.findAll();
    }

  
    async update(
      id: string,
      updateUserDto: UpdateManagerDto,
    ): Promise<Manager> {
      const updatedManager = await this.ManagerRepository.update(id,{
        ...updateUserDto, organizationId: updateUserDto.organizationId
        ? new mongoose.Types.ObjectId(updateUserDto.organizationId)
        : undefined,});
      if (!updatedManager) {
        throw new NotFoundException(`Manager with ID ${id} not found`);
      }
      return updatedManager;
    }
  
    // Remove user
    async remove(id: string): Promise<Manager> {
      return this.ManagerRepository.update(id, {
        deleted_at: new Date,
        isActive: false
      })
    }

    async setActiveIsTrue(id: string): Promise<Manager> {
      return this.ManagerRepository.update(id, {
        isActive: true
      })
    }

    async getManagerByEmail(email: string): Promise<Manager> {
        const Manager = await this.ManagerRepository.findOne({ email });
    
        if (!Manager) {
          throw new NotFoundException(`Manager with email ${email} not found`);
        }
    
        return Manager;
      }
    
  }
  