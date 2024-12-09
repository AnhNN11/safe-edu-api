import { UsersRepositoryInterface } from '@modules/users/interfaces/users.interface';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, PopulateOptions } from 'mongoose';
import { BaseRepositoryAbstract } from './base/base.abstract.repository';
import { FindAllResponse, QueryParams } from 'src/types/common.type';
import { UserRole } from '@modules/user-roles/entities/user-role.entity';
import { Test, TestDocument } from '@modules/users copy/entities/test.entity';
import { TestRepositoryInterface } from '@modules/users copy/interfaces/test.interface';

@Injectable()
export class TestRepository
	extends BaseRepositoryAbstract<Test>
	implements TestRepositoryInterface
{
	constructor(
		@InjectModel(Test.name)
		private readonly user_model: Model<TestDocument>,
	) {
		super(user_model);
	}

	async findAllWithSubFields(
		condition: FilterQuery<TestDocument>,
		options: QueryParams & { projection?: string; populate?: string[] | any },
	): Promise<FindAllResponse<TestDocument>> {
		try {
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

			const filterConditions = filter.map(
				({ column, value, filterOperator }) => {
					switch (filterOperator) {
						case 1: 
							return { [column]: { $eq: value } };
						case 2:
							return { [column]: { $regex: value, $options: 'i' } };
						case 3: 
							return { [column]: { $gt: value } };
						case 4: 
							return { [column]: { $lt: value } };
						default:
							return {};
					}
				},
			);

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
			console.log('====_===', count, items);

			return {
				count,
				items,
			};
		} catch (error) {
			console.error('Error in findAllWithSubFields:', error);
			throw new Error(`Failed to fetch documents: ${error.message}`);
		}
	}

	async getUserWithRole(user_id: string): Promise<Test> {
		return await this.user_model
			.findById(user_id, '-password')
			.populate([{ path: 'role', transform: (role: UserRole) => role?.name }])
			.exec();
	}
}
