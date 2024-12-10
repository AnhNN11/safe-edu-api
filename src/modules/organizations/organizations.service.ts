import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { QueryParams } from 'src/types/common.type';
import { Organization } from './entities/organization.entity';
import { ConfigService } from '@nestjs/config';
import mongoose from 'mongoose';
import { OrganizationsRepositoryInterface } from '@modules/organizations/interfaces/organizations.interface';
import { log } from 'console';

@Injectable()
export class OrganizationsService {
  constructor(
		@Inject('OrganizationsRepositoryInterface')
		private readonly organizations_repository: OrganizationsRepositoryInterface,
	) {}

  async create(create_dto: CreateOrganizationDto):Promise<Organization> {
    try {
      const {name, address} = create_dto;
      
    //check if name exist
      // if(!this.organizations_repository.isNameExist(name, address)) {
      //   const organization = await this.organizations_repository.create({
      //     ...create_dto
      //   })
      //   return organization;
      // }
      return await this.organizations_repository.create({
        ...create_dto
      })
    } catch (error) {
      throw new Error(`Failed to create organization: ${error.message}`);
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

  async update(
    id: string,
    updateOrganizationDto: UpdateOrganizationDto,
  ): Promise<Organization> {
    const updatedOrganization = await this.organizations_repository.update(id, updateOrganizationDto);
    if (!updatedOrganization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
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
}
