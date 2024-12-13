import { UserRole } from '../entities/user-role.entity';

export interface UserRolesRepositoryInterface {
  create(data: Partial<UserRole>): Promise<UserRole>;
  findAll(): Promise<UserRole[]>;
  findOne(id: string): Promise<UserRole | null>;
  findOneByName(name:string): Promise<UserRole |null>;
  update(id: string, data: Partial<UserRole>): Promise<UserRole>;
  remove(id: string): Promise<void>;
}
