import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCitizenDto } from './dto/create-citizen.dto';
import { UpdateCitizenDto } from './dto/update-citizen.dto';
import { OrganizationsService } from '@modules/organizations/organizations.service';
import { FilterQuery } from 'mongoose';
import { Citizen } from './entities/citizen.entity';
import { CitizensRepositoryInterface } from './interfaces/citizens.interfaces';

@Injectable()
export class CitizensService {
	constructor(
		@Inject('CitizensRepositoryInterface')
		private readonly CitizensRepository: CitizensRepositoryInterface,
		private readonly organizationService: OrganizationsService, 
	  ) {}

	async setCurrentRefreshToken(_id: string, refreshToken: string): Promise<void> {
		try {
		  const Citizen = await this.CitizensRepository.findOneByCondition({ _id });
		  if (!Citizen) {
			throw new Error('User not found');
		  }
		  	Citizen.current_refresh_token = refreshToken;  
			await this.CitizensRepository.update(_id, { current_refresh_token: refreshToken }); 
			
		  	console.log(`Refresh token for user ${_id} has been updated.`);
		} catch (error) {
		  console.error(`Failed to set refresh token for user ${_id}:`, error);
		  throw new Error('Failed to set refresh token');
		}
	  }
	  async create(createDto: CreateCitizenDto): Promise<Citizen> {
		const { first_name, last_name, phone_number, password } = createDto;
		const Citizen = await this.CitizensRepository.create({
			first_name,
			last_name,
			phone_number,
			password,
		});
		return Citizen;
	  }

	  async findAll() {
		return await this.CitizensRepository.findAll();
	  }

	async findOne(_id: string) {
		return await this.CitizensRepository.findOneByCondition({_id});
	}
	async findOneByCondition(condition: FilterQuery<Citizen>): Promise<Citizen | null> {
		return this.CitizensRepository.findOneByCondition(condition);
	}

	async update(
		id: string,
		updateCitizenDto: UpdateCitizenDto,
	  ): Promise<Citizen> {
		const updatedUser = await this.CitizensRepository.update(id,{...updateCitizenDto});
		if (!updatedUser) {
		  throw new NotFoundException(`Citizen with ID ${id} not found`);
		}
		return updatedUser;
	  }

	  async remove(id: string): Promise<void> {
		const result = await this.CitizensRepository.remove(id);
		if (!result) {
		  throw new NotFoundException(`Citizen with ID ${id} not found`);
		}
	  }

	async delete(id: string): Promise<Citizen> {
		return await this.CitizensRepository.update(id, {
		  deleted_at: new Date(),
		});
	}
}
