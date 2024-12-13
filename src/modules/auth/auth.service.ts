// import { USER_ROLE } from '@modules/user-roles/entities/user-role.entity';
// import * as bcrypt from 'bcryptjs';
// import { ConfigService } from '@nestjs/config';
// import { JwtService } from '@nestjs/jwt';
// import {
// 	BadRequestException,
// 	ConflictException,
// 	ConsoleLogger,
// 	HttpException,
// 	HttpStatus,
// 	Injectable,
// 	UnauthorizedException,
// } from '@nestjs/common';

// // INNER
// import { SignUpDto, SignUpGoogleDto } from './dto/sign-up.dto';

// // OUTER
// import { TokenPayload } from './interfaces/token.interface';
// import {
// 	access_token_private_key,
// 	refresh_token_private_key,
// } from 'src/constraints/jwt.constraint';
// import { ERRORS_DICTIONARY } from 'src/constraints/error-dictionary.constraint';
// import { UserRolesService } from '@modules/user-roles/user-roles.service';
// import { SignUpWithStudentDto } from './dto/sign-up-with-student.dto';
// import { AdminService } from '@modules/admin/admin.service';
// import { SignUpWithCitizenDto } from './dto/sign-up-with-citizen.dto';

// @Injectable()
// export class AuthService {
// 	private SALT_ROUND = 11;
// 	constructor(
// 		private config_service: ConfigService,
// 		private readonly admin_service: AdminService,
// 		private readonly user_role : UserRolesService,
		
// 		private readonly jwt_service: JwtService,
// 	) {}

	

	
// 	async signIn(id: string) {
// 		try {
// 			const access_token = this.generateAccessToken({
// 				id,
// 			});
// 			const refresh_token = this.generateRefreshToken({
// 				id
// 			});
// 			await this.storeRefreshToken(id, refresh_token);
// 			return {
// 				access_token,
// 				refresh_token,
// 			};
// 		} catch (error) {
// 			throw error;
// 		}
// 	}

	

// 	private async verifyPlainContentWithHashedContent(
// 		plain_text: string,
// 		hashed_text: string,
// 	) {
// 		const is_matching = await bcrypt.compare(plain_text, hashed_text);
// 		if (!is_matching) {
// 			throw new BadRequestException({
// 				message: ERRORS_DICTIONARY.CONTENT_NOT_MATCH,
// 				details: 'Content not match!!',
// 			});
// 		}
// 	}

	
	

// 	generateAccessToken(payload: TokenPayload) {
// 		return this.jwt_service.sign(payload, {
// 			algorithm: 'RS256',
// 			privateKey: access_token_private_key,
// 			expiresIn: `${this.config_service.get<string>(
// 				'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
// 			)}s`,
// 		});
// 	}

// 	generateRefreshToken(payload: TokenPayload) {
// 		return this.jwt_service.sign(payload, {
// 			algorithm: 'RS256',
// 			privateKey: refresh_token_private_key,
// 			expiresIn: `${this.config_service.get<string>(
// 				'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
// 			)}s`,
// 		});
// 	}

// 	async storeRefreshToken(id: string, token: string): Promise<void> {
// 		try {
// 			const hashed_token = await bcrypt.hash(token, this.SALT_ROUND);
// 			await this.admin_service.setCurrentRefreshToken(id, hashed_token);
// 		} catch (error) {
// 			throw error;
// 		}
// 	}

	
// }
