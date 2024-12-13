import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenPayload } from '../interfaces/token.interface';
import { access_token_public_key } from 'src/constraints/jwt.constraint';

import { AdminService } from '@modules/admin/admin.service';

import { UnauthorizedException } from '@nestjs/common';
import { SupervisorsService } from '@modules/supervisors/supervisors.service';
import { StudentsService } from '@modules/students/students.service';

@Injectable()
export class JwtAccessTokenStrategy extends PassportStrategy(Strategy) {
	constructor(
		private readonly studentService: StudentsService,
		private readonly supervisorService: SupervisorsService,
		private readonly adminService: AdminService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: access_token_public_key,
		});
	}

	// Phương thức xác thực
	async validate(payload: TokenPayload) {
		const { userId, role } = payload;
		switch (role) {
			case 'student':
				const student = await this.studentService.findOne(userId);
				if (!student)
					throw new UnauthorizedException('Access Denied: User not found.');
				return student;
			case 'supervisor':
				const supervisor = await this.supervisorService.findOne(userId);
				if (!supervisor)
					throw new UnauthorizedException('Access Denied: User not found.');
				return supervisor;

			default:
				throw new UnauthorizedException('Access Denied: Role not recognized.');
		}
	}
}
