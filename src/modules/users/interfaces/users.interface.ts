import { User } from '@modules/users/entities/user.entity';
import { FilterQuery } from 'mongoose';
import { FindAllResponse, QueryParams } from 'src/types/common.type';

export interface UsersRepositoryInterface {
	create(data: Partial<User>): Promise<User>;
	findAll();
	getUserWithRole(userId: string): Promise<User | null>;
	update(id: string, data: Partial<User>): Promise<User | null>;
	remove(id: string): Promise<boolean>;
	findOne(condition: FilterQuery<User>): Promise<User | null>;  
	findById(id : string)
}
