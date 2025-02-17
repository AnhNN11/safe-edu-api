import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { QueryParams } from 'src/types/common.type';
import { Organization } from './entities/organization.entity';
import { ConfigService } from '@nestjs/config';
import mongoose from 'mongoose';
import { OrganizationsRepositoryInterface } from '@modules/organizations/interfaces/organizations.interface';
import { log } from 'console';
import { ERRORS_DICTIONARY } from 'src/constraints/error-dictionary.constraint';
import { measureMemory } from 'vm';

@Injectable()
export class OrganizationsService {
  constructor(
		@Inject('OrganizationsRepositoryInterface')
		private readonly organizations_repository: OrganizationsRepositoryInterface,
	) {}

  async create(create_dto: CreateOrganizationDto): Promise<Organization> {
    try {
      const { name, province_id } = create_dto;
      const existed_organization = await this.organizations_repository.findOne({ name, province_id });
  
      if (existed_organization) {
        throw new BadRequestException({
          message: ERRORS_DICTIONARY.ORGANIZATION_NAME_EXISTS,
          details: 'Organization already existed!!',
        });
      }
  
      const organization = await this.organizations_repository.create({
        ...create_dto,
        province_id: new mongoose.Types.ObjectId(province_id),
      });
      return this.organizations_repository.findOne(organization);
    } catch (error) {
      throw error;
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

  remove(_id: string) {
    if (mongoose.isValidObjectId(_id)){
      return this.organizations_repository.remove(_id)  
    } else {
      throw new BadRequestException("Invalid Id")
    }
  }

  async findAllIsActive() {
    return await this.organizations_repository.findAllIsActive();
  }

  async setIsActiveTrue(id: string): Promise<Organization> {
    return await this.organizations_repository.update(id, {
      isActive: true
    })
  }
}
