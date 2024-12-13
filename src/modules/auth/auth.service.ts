import { USER_ROLE } from '@modules/user-roles/entities/user-role.entity';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
	BadRequestException,
	ConflictException,
	ConsoleLogger,
	HttpException,
	HttpStatus,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';

// INNER
import { SignUpDto, SignUpGoogleDto } from './dto/sign-up.dto';

// OUTER
import { User } from '@modules/users/entities/user.entity';
import { UsersService } from '@modules/users/users.service';
import { TokenPayload } from './interfaces/token.interface';
import {
	access_token_private_key,
	refresh_token_private_key,
} from 'src/constraints/jwt.constraint';
import { ERRORS_DICTIONARY } from 'src/constraints/error-dictionary.constraint';
import { UserRolesService } from '@modules/user-roles/user-roles.service';
import { log } from 'node:console';
import { AdminService } from '@modules/admin/admin.service';

@Injectable()
export class AuthService {
	private SALT_ROUND = 11;
	constructor(
		private config_service: ConfigService,
		private readonly users_service: UsersService,
		private readonly admin_service: AdminService,
		private readonly user_role : UserRolesService,
		
		private readonly jwt_service: JwtService,
	) {}

	async authInWithGoogle(sign_up_dto: SignUpGoogleDto) {
		try {
			let admin = await this.admin_service.findOneByCondition({
				email: sign_up_dto.email,
			});

			try {
				if (admin) {
					const signInResult = await this.signIn(admin._id.toString());
		
					return signInResult;
				}
			  } catch (error) {
				// Log lỗi khi có ngoại lệ xảy ra
				throw new HttpException({
				  statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
				  message: "Sign in failed",
				  error: error.message,
				}, HttpStatus.INTERNAL_SERVER_ERROR);
			  }
			// 🔎 Từ bước này trở xuống sẽ tương tự với method signUp đã có
			// 🟢 Mọi người có thể refactor lại để tránh lặp code nếu muốn
			admin = await this.admin_service.create({
				...sign_up_dto,
			
			});
			const refresh_token = this.generateRefreshToken({
				id: admin._id.toString(),
			});
			await this.storeRefreshToken(admin._id.toString(), refresh_token);
			return {
				access_token: this.generateAccessToken({
					id: admin._id.toString(),
				}),
				refresh_token,
			};
		} catch (error) {
			throw error;
		}
	}

	async signUp(sign_up_dto: SignUpDto) {
		try {
			const existed_user = await this.users_service.findOneByCondition({
				email: sign_up_dto.email,
			});
			if (existed_user) {
				throw new ConflictException({
					message: ERRORS_DICTIONARY.EMAIL_EXISTED,
					details: 'Email already existed!!',
				});
			}
			const hashed_password = await bcrypt.hash(
				sign_up_dto.password,
				this.SALT_ROUND,
			);
			const user = await this.users_service.create({
				...sign_up_dto,
				username: `${sign_up_dto.email.split('@')[0]}${Math.floor(
					10 + Math.random() * (999 - 10),
				)}`, // Random username
				password: hashed_password,
			});
			const refresh_token = this.generateRefreshToken({
				id: user._id.toString(),
			});
			await this.storeRefreshToken(user._id.toString(), refresh_token);
			return {
				access_token: this.generateAccessToken({
					id: user._id.toString(),
				}),
				refresh_token,
			};
		} catch (error) {
			throw error;
		}
	}

	async signIn(id: string) {
		try {
			const access_token = this.generateAccessToken({
				id,
			});
			const refresh_token = this.generateRefreshToken({
				id
			});
			await this.storeRefreshToken(id, refresh_token);
			return {
				access_token,
				refresh_token,
			};
		} catch (error) {
			throw error;
		}
	}

	async getAuthenticatedUser(email: string, password: string): Promise<User> {
		try {
			const user = await this.users_service.getUserByEmail(email);
			await this.verifyPlainContentWithHashedContent(password, user.password);
			return user;
		} catch (error) {
			throw new BadRequestException({
				message: ERRORS_DICTIONARY.WRONG_CREDENTIALS,
				details: 'Wrong credentials!!',
			});
		}
	}

	private async verifyPlainContentWithHashedContent(
		plain_text: string,
		hashed_text: string,
	) {
		const is_matching = await bcrypt.compare(plain_text, hashed_text);
		if (!is_matching) {
			throw new BadRequestException({
				message: ERRORS_DICTIONARY.CONTENT_NOT_MATCH,
				details: 'Content not match!!',
			});
		}
	}

	async getUserIfRefreshTokenMatched(
		id: string,
		refresh_token: string,
	): Promise<User> {
		try {
			const user = await this.users_service.findOneByCondition({
				_id: id,
			});
			if (!user) {
				
				
				throw new UnauthorizedException({
					message: ERRORS_DICTIONARY.UNAUTHORIZED_EXCEPTION,
					details: 'Unauthorized',
				});
			}
			await this.verifyPlainContentWithHashedContent(
				refresh_token,
				user.current_refresh_token,
			);
			return user;
		} catch (error) {
			throw error;
		}
	}

	generateAccessToken(payload: TokenPayload) {
		return this.jwt_service.sign(payload, {
			algorithm: 'RS256',
			privateKey: access_token_private_key,
			expiresIn: `${this.config_service.get<string>(
				'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
			)}s`,
		});
	}

	generateRefreshToken(payload: TokenPayload) {
		return this.jwt_service.sign(payload, {
			algorithm: 'RS256',
			privateKey: refresh_token_private_key,
			expiresIn: `${this.config_service.get<string>(
				'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
			)}s`,
		});
	}

	async storeRefreshToken(id: string, token: string): Promise<void> {
		try {
			const hashed_token = await bcrypt.hash(token, this.SALT_ROUND);
			await this.admin_service.setCurrentRefreshToken(id, hashed_token);
		} catch (error) {
			throw error;
		}
	}
}
