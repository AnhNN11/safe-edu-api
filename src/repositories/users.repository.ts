import { User, UserDocument } from '@modules/users/entities/user.entity';
import { UsersRepositoryInterface } from '@modules/users/interfaces/users.interface';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, PopulateOptions } from 'mongoose';
import { BaseRepositoryAbstract } from './base/base.abstract.repository';
import { FindAllResponse, QueryParams } from 'src/types/common.type';
import { UserRole } from '@modules/user-roles/entities/user-role.entity';

@Injectable()
export class UsersRepository
	extends BaseRepositoryAbstract<User>
	implements UsersRepositoryInterface
{
	constructor(
		@InjectModel(User.name)
		private readonly user_model: Model<UserDocument>,
	) {
		super(user_model);
	}

	async findAllWithSubFields(
		condition: FilterQuery<UserDocument>,
		options: QueryParams & { projection?: string; populate?: string[] | any },
	): Promise<FindAllResponse<UserDocument>> {
		const { page, limit, sort, filter, globalFilter, projection, populate } =
			options;

		const offset = page * limit;

		const sortParams = sort.reduce(
			(acc, { column, isAscending }) => {
				acc[column] = isAscending ? 1 : -1;
				return acc;
			},
			{} as Record<string, 1 | -1>,
		);

		const filterConditions = filter.map(({ column, value, filterOperator }) => {
			switch (filterOperator) {
				case 1: // Equal
					return { [column]: { $eq: value } };
				case 2: // Contains
					return { [column]: { $regex: value, $options: 'i' } };
				case 3: // Greater than
					return { [column]: { $gt: value } };
				case 4: // Less than
					return { [column]: { $lt: value } };
				default:
					return {};
			}
		});

		const combinedCondition = {
			...condition,
			...Object.assign({}, ...filterConditions),
			deleted_at: null, 
		};

		if (globalFilter?.value) {
			combinedCondition['$text'] = { $search: globalFilter.value };
		}

		const [count, items] = await Promise.all([
			this.user_model.countDocuments(combinedCondition),
			this.user_model
				.find(combinedCondition, projection || '', {
					skip: offset,
					limit,
					sort: sortParams,
				})
				.populate(populate || ''),
		]);

		return {
			count,
			items,
		};
	}

	async getUserWithRole(user_id: string): Promise<User> {
		return await this.user_model
			.findById(user_id, '-password')
			.populate([{ path: 'role', transform: (role: UserRole) => role?.name }])
			.exec();
	}
}
