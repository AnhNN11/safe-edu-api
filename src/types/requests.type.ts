import { Admin } from '@modules/admin/entities/admin.entity';
import { User } from '@modules/users/entities/user.entity';
import { Request } from 'express';

export interface RequestWithUser extends Request {
	user: User;
}

export interface RequestWithAdmin extends Request {
	admin: Admin;
}
