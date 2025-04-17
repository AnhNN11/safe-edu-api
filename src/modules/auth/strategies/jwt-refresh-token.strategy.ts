import { Request } from 'express';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AuthService } from '../auth.service';
import { TokenPayload } from '../interfaces/token.interface';
import { refresh_token_public_key } from 'src/constraints/jwt.constraint';
import { AdminService } from '@modules/admin/admin.service';
import { StudentsService } from '@modules/students/students.service';
import { CitizensService } from '@modules/citizens/citizens.service';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
	Strategy,
	'refresh_token',
) {
	constructor(
		private readonly adminService: AdminService,
		private readonly studentService: StudentsService,
		private readonly citizenService: CitizensService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: refresh_token_public_key,
			passReqToCallback: true,
		});
	}

	async validate(req: Request, payload: any) {
		const { userId, role } = payload;
		const { exp, ...newPayload } = payload;
		switch (role) {
			case 'Citizen':
				const citizen = await this.citizenService.findOne(userId);
				if (!citizen) {
					throw new UnauthorizedException('Access Denied: Citizen not found.');
				}
				break;
			case 'Student':
				const student = await this.studentService.findOne(userId);
				if (!student) {
					throw new UnauthorizedException('Access Denied: Student not found.');
				}
				break;
			case 'Admin':
				const admin = await this.adminService.findOneById(userId);
				if (!admin) {
					throw new UnauthorizedException('Access Denied: Admin not found.');
				}
				break;
			default:
				throw new UnauthorizedException('Access Denied: Invalid role.');
		}

		return newPayload;
	}
}
