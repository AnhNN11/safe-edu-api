import { FilterQuery } from 'mongoose';
import { Manager } from '../entities/manager.entity';

export interface ManagerRepositoryInterface {
	create(createDto: any): Promise<Manager>;
	findAll();
	update(id: string, updateData: any): Promise<Manager | null>;
	remove(id: string): Promise<boolean>;
	findOne(condition: FilterQuery<Manager>): Promise<Manager | null>;  
	findById(id : string)
}
