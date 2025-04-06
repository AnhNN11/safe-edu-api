import { BadRequestException, ConflictException, HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { Organization } from './entities/organization.entity';
import mongoose, { Types } from 'mongoose';
import { OrganizationsRepositoryInterface } from '@modules/organizations/interfaces/organizations.interface';
import { ERRORS_DICTIONARY } from 'src/constraints/error-dictionary.constraint';
import { ManagerRepositoryInterface } from '@modules/manager/interfaces/manager.interface';
import { stat } from 'fs';

@Injectable()
export class OrganizationsService {
  constructor(
		@Inject('OrganizationsRepositoryInterface')
		private readonly organizations_repository: OrganizationsRepositoryInterface,
    @Inject('ManagerRepositoryInterface')
    private readonly manager_repository: ManagerRepositoryInterface,
	) {}

  async create(create_dto: CreateOrganizationDto): Promise<Organization> {
    try {
      const { name, province_id, slug, email} = create_dto;
      const existed_organization = await this.organizations_repository.findOne({ name, province_id });
      const existed_slug = await this.organizations_repository.findOne({slug});
      const existed_manager = await this.manager_repository.findOne({email});
      
      
      if (!existed_manager) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Không tìm thấy quản lí tổ chức',
          details: 'Manager not found!!',
        });
      }
  
      if (existed_organization) {
        throw new BadRequestException({
          message: ERRORS_DICTIONARY.ORGANIZATION_NAME_EXISTS,
          details: 'Organization already existed!!',
        });
      }

      if (existed_slug) {
        throw new BadRequestException({
          message: ERRORS_DICTIONARY.ORGANIZATION_SLUG_ALREADY_EXIST,
          details: 'Slug already existed!!', 
        });
      }
  
      const organization = await this.organizations_repository.create({
        ...create_dto,
        province_id: new mongoose.Types.ObjectId(province_id),
        manager_id: [new Types.ObjectId(existed_manager.id)]
      });
      console.log('🔧 Updating manager with ID:', existed_manager._id);
      return this.organizations_repository.findOne(organization);
    } catch (error) {
      console.error('Update failed:', error);
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message,
        details: 'Đã có lỗi xảy ra trong quá trình tạo tổ chức, vui lòng thử lại sau!',
      });
    }
  }
  

  async findAll() {
    return await this.organizations_repository.findAll();
  }

  async findOneById(_id: string) {
    //check id
    if (mongoose.isValidObjectId(_id)) {
      return await this.organizations_repository.findById(_id);
    } 
  }

  async update(id: string, updateOrganizationDto: UpdateOrganizationDto): Promise<Organization> {
    const updatedOrganization = await this.organizations_repository.update(id, {
      ...updateOrganizationDto,
      province_id: updateOrganizationDto.province_id
            ? new mongoose.Types.ObjectId(updateOrganizationDto.province_id)
            : undefined,
    });
    if (!updatedOrganization) {
      throw new NotFoundException(`Trường cần tìm không tồn tại: ${id}`);
    }
    return updatedOrganization;
  }

  async remove(_id: string) {
    if (mongoose.isValidObjectId(_id)){
      return await this.organizations_repository.remove(_id)  
    } else {
      throw new BadRequestException("Invalid Id")
    }
  }

  async setIsActiveTrue(id: string) {
    return await this.organizations_repository.setIsActive(id);
  }
}
