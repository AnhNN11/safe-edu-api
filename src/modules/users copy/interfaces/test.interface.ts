import { User } from '@modules/users/entities/user.entity';
import { BaseRepositoryInterface } from '@repositories/base/base.interface.repository';
import { FindAllResponse, QueryParams } from 'src/types/common.type';
import { Test } from '../entities/test.entity';

export interface TestRepositoryInterface extends BaseRepositoryInterface<Test> {
	findAllWithSubFields(
		condition: object,
		options: QueryParams & {
			projection?: string;
			populate?: string[] | any;
		},
	): Promise<FindAllResponse<Test>>;

	getUserWithRole(user_id: string): Promise<Test>;
}
