import {
	BadRequestException,
	Inject,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// INNER

// OUTER
import { USER_ROLE } from '@modules/user-roles/entities/user-role.entity';
import { BaseServiceAbstract } from 'src/services/base/base.abstract.service';
import { UserRolesService } from '@modules/user-roles/user-roles.service';
import { FindAllResponse, QueryParams } from 'src/types/common.type';
import { Test } from './entities/test.entity';
import { TestRepositoryInterface } from './interfaces/test.interface';
import { CreateTestDto } from './dto/create-test.dto';

@Injectable()
export class TestService extends BaseServiceAbstract<Test> {
	constructor(
		@Inject('TestRepositoryInterface')
		private readonly users_repository: TestRepositoryInterface,
	) {
		super(users_repository);
	}

	async create(create_dto: CreateTestDto): Promise<Test> {
		try {
			const user = await this.users_repository.create({
				...create_dto,
			});
			return user;
		} catch (error) {
			throw new Error(`Failed to create user: ${error.message}`);
		}
	}

	async findAll(queryParams: QueryParams): Promise<FindAllResponse<Test>> {
		console.log(queryParams);

		return await this.users_repository.findAllWithSubFields(
			{},
			{
				...queryParams,
			},
		);
	}

	async getUserByEmail(email: string): Promise<Test> {
		try {
			const user = await this.users_repository.findOneByCondition({ email });
			if (!user) {
				throw new NotFoundException();
			}
			return user;
		} catch (error) {
			throw error;
		}
	}

	async getUserWithRole(user_id: string): Promise<Test> {
		try {
			return await this.users_repository.getUserWithRole(user_id);
		} catch (error) {
			throw error;
		}
	}
}
