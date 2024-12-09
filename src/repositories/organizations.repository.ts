import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { OrganizationsRepositoryInterface } from '@modules/organizations/interfaces/organizations.interface';
import { Organization } from '@modules/organizations/entities/organization.entity';

@Injectable()
export class OrganizationsRepository implements OrganizationsRepositoryInterface {
	constructor(
		@InjectModel(Organization.name) private readonly organizationModel: Model<Organization>,
	) {}
	async findOne(condition: FilterQuery<Organization>): Promise<Organization | null> {
		return await this.organizationModel.findOne(condition).exec(); 
	  }
	async create(data: Partial<Organization>): Promise<Organization> {
		const newUser = new this.organizationModel(data);
		return await newUser.save();
	}
	async findAll() {
		const organizations = await this.organizationModel
		  .find()
		  .populate('role')
		  .exec(); 
	  
		const total = await this.organizationModel.countDocuments().exec();
		return { items: organizations, total };
	  }

	async update(id: string, data: Partial<Organization>): Promise<Organization | null> {
		return await this.organizationModel.findByIdAndUpdate(id, data, { new: true }).exec();
	}

	async remove(id: string): Promise<boolean> {
		const result = await this.organizationModel.findByIdAndDelete(id).exec();
		return !!result;
	}

	async findById(id: string): Promise<Organization | null> {
		return await this.organizationModel.findById(id).exec(); // Using Mongoose's findById method
	}

	async isNameExist(name: string, address: string) {
		if(this.organizationModel.exists({ address }) && !this.organizationModel.exists({ name })) {
			return true;
		} else {
			return false;
		}
	}
}
