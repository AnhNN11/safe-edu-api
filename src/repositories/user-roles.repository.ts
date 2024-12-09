import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose'; // Assuming this is a base class you want to extend
import { UserRole, UserRoleDocument } from '@modules/user-roles/entities/user-role.entity';
import { UserRolesRepositoryInterface } from '@modules/user-roles/interfaces/user-roles.interface';

@Injectable()
export class UserRolesRepository
  implements UserRolesRepositoryInterface
{
  constructor(
    @InjectModel(UserRole.name) private readonly user_role_model: Model<UserRoleDocument>,
  ) {
  
  }

  // Create method
  async create(data: Partial<UserRole>): Promise<UserRole> {
    const createdUserRole = new this.user_role_model(data);
    return createdUserRole.save();
  }

  // Find all method
  async findAll(): Promise<UserRole[]> {
    return this.user_role_model.find().exec();
  }

  // Find one method by id
  async findOne(id: string): Promise<UserRole | null> {
    return this.user_role_model.findById(id).exec();
  }

  // Update method
  async update(id: string, data: Partial<UserRole>): Promise<UserRole> {
    return this.user_role_model.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  // Remove method
  async remove(id: string): Promise<void> {
    await this.user_role_model.findByIdAndDelete(id).exec();
  }
}
