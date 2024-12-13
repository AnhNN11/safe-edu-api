import { log } from 'node:console';
import { UserRole } from '@modules/user-roles/entities/user-role.entity';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ROLES } from 'src/decorators/roles.decorator';
import { RequestWithUser } from 'src/types/requests.type';
import { UsersService } from 'src/modules/users/users.service'; 
import { UserRolesService } from '@modules/user-roles/user-roles.service';


@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private readonly refector: Reflector) {}

	canActivate(
		context: ExecutionContext,
	): boolean | Promise<boolean> | Observable<boolean> {
		const roles: string[] = this.refector.getAllAndOverride(ROLES, [
			context.getHandler(),
			context.getClass(),
		]);
    console.log('3:'+roles);
		const request: RequestWithUser = context.switchToHttp().getRequest();
    console.log('4:'+roles.includes(request.user.role as unknown as string));
		return roles.includes(request.user.role as unknown as string);
	}
}