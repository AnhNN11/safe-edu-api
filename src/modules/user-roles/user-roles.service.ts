import { Inject, Injectable } from '@nestjs/common';
import { UserRole } from './entities/user-role.entity';
import { UserRolesRepositoryInterface } from './interfaces/user-roles.interface';

@Injectable()
export class UserRolesService {
	constructor(
		@Inject('UserRolesRepositoryInterface')
		private readonly user_roles_repository: UserRolesRepositoryInterface,
	) {}

	async create(create_user_role_dto: any): Promise<UserRole> {
		return this.user_roles_repository.create(create_user_role_dto);
	}

	async findAll(): Promise<UserRole[]> {
		return this.user_roles_repository.findAll();
	}

	async findOne(id: string): Promise<UserRole> {
		return this.user_roles_repository.findOne(id);
	}

	async update(id: string, update_user_role_dto: any): Promise<UserRole> {
		return this.user_roles_repository.update(id, update_user_role_dto);
	}

	async remove(id: string): Promise<void> {
		await this.user_roles_repository.remove(id);
	}
}
