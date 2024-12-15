import { Student } from '@modules/Students/entities/Student.entity';
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
import { StudentsService } from '@modules/students/students.service';

// INNER
import { SignUpDto, SignUpGoogleDto } from './dto/sign-up.dto';

// OUTER
import { TokenPayload } from './interfaces/token.interface';
import {
	access_token_private_key,
	refresh_token_private_key,
} from 'src/constraints/jwt.constraint';
import { ERRORS_DICTIONARY } from 'src/constraints/error-dictionary.constraint';
import { SignUpWithStudentDto } from './dto/sign-up-with-student.dto';
import { AdminService } from '@modules/admin/admin.service';
import { SignUpWithCitizenDto } from './dto/sign-up-with-citizen.dto';
import { RolesEnum } from 'src/enums/roles..enum';
import { CitizensService } from '@modules/citizens/Citizens.service';
import { Citizen } from '@modules/citizens/entities/Citizen.entity';

@Injectable()
export class AuthService {
	private SALT_ROUND = 11;
	constructor(
		private config_service: ConfigService,
		private readonly admin_service: AdminService,
		private readonly student_service: StudentsService,
		private readonly citizen_service: CitizensService,
		private readonly jwt_service: JwtService,
	) {}

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

	// async getUserIfRefreshTokenMatched(
	// 	user_id: string,
	// 	refresh_token: string,
	// ): Promise<User> {
	// 	try {
	// 		const user = await this.users_service.findOneByCondition({
	// 			_id: user_id,
	// 		});
	// 		if (!user) {
	// 			throw new UnauthorizedException({
	// 				message: ERRORS_DICTIONARY.UNAUTHORIZED_EXCEPTION,
	// 				details: 'Unauthorized',
	// 			});
	// 		}
	// 		await this.verifyPlainContentWithHashedContent(
	// 			refresh_token,
	// 			user.current_refresh_token,
	// 		);
	// 		return user;
	// 	} catch (error) {
	// 		throw error;
	// 	}
	// }


	async storeRefreshTokenForStudent(_id: string, token: string): Promise<void> {
		try {
			const hashed_token = await bcrypt.hash(token, this.SALT_ROUND);
			await this.student_service.setCurrentRefreshToken(_id, hashed_token);
		} catch (error) {
			throw error;
		}
	}

	async storeRefreshTokenForCitizen(_id: string, token: string): Promise<void> {
		try {
			const hashed_token = await bcrypt.hash(token, this.SALT_ROUND);
			await this.citizen_service.setCurrentRefreshToken(_id, hashed_token);
		} catch (error) {
			throw error;
		}
	}

	async signIn(_id: string) {
		try {
			const [student, citizen] = await Promise.all([
				await this.student_service.findOneByCondition({ _id }),
				await this.citizen_service.findOneByCondition({ _id })
			]);

			if (student) {
				console.log("hello" + student)
				const access_token = this.generateAccessToken({
					userId: student._id.toString(),
					role: 'Student',
				});
				const refresh_token = this.generateRefreshToken({
					userId: student._id.toString(),
					role: 'Student',
				});
				await this.storeRefreshTokenForStudent(_id, refresh_token);
				return {
					access_token,
					refresh_token,
				};
			} 

			if (citizen) {
				const access_token = this.generateAccessToken({
					userId: citizen._id.toString(),
					role: 'Citizen',
				});
				const refresh_token = this.generateRefreshToken({
					userId: citizen._id.toString(),
					role: 'Citizen',
				});
				await this.storeRefreshTokenForStudent(_id, refresh_token);
				return {
					access_token,
					refresh_token,
				};
			}
		} catch (error) {
			throw error;
		}
	}


	async getAuthenticatedUser(phone_number: string, password: string): Promise<Student | Citizen> {
		try {
			const student = await this.student_service.findOneByCondition({ phone_number })
			if (student) {
				await this.verifyPlainContentWithHashedContent(password, student.password);
				return student;
			}
			
			const citizen = await this.citizen_service.findOneByCondition({ phone_number });
			if (citizen) {
				await this.verifyPlainContentWithHashedContent(password, citizen.password);
				return citizen;
			}
		} catch (error) {
			throw new BadRequestException({
				message: ERRORS_DICTIONARY.WRONG_CREDENTIALS,
				details: 'Wrong credentials!!',
			});
		}
	}

	async signUpWithStudent(sign_up_with_std_dto: SignUpWithStudentDto) {
		try {
			const { first_name, last_name, phone_number, organizationId } =
				sign_up_with_std_dto;
			const existed_student_phone_number =
				await this.student_service.findOneByCondition({
					phone_number: sign_up_with_std_dto.phone_number,
				});

			if (first_name == null || last_name == null) {
				throw new ConflictException({
					message: ERRORS_DICTIONARY.STUDENT_NAME_IS_NULL,
					details: 'Name can not be null or empty!!',
				});
			}
			const hashed_password = await bcrypt.hash(
				sign_up_with_std_dto.password,
				this.SALT_ROUND,
			);
			const student = await this.student_service.create({
				first_name,
				last_name,
				phone_number,
				password: hashed_password,
				organizationId,
			});

			const refresh_token = this.generateRefreshToken({
				userId: student._id.toString(),
				role: 'Student',
			});
			try {
				await this.storeRefreshTokenForStudent(student._id.toString(), refresh_token);
				return {
					access_token: this.generateAccessToken({
						userId: student._id.toString(),
						role: 'Student',
					}),
					refresh_token,
				};
		} catch (error) {
			console.error(
				'Error storing refresh token or generating access token:',
				error,
			);
			throw new Error(
				'An error occurred while processing tokens. Please try again.',
			);
		}
		} catch(error) {
			throw error;
		}	
	}

	async signUpWithCitizen(sign_up_with_citizen_dto: SignUpWithCitizenDto) {
		try {
			const { first_name, last_name, phone_number } =
			sign_up_with_citizen_dto;
			const existed_student_phone_number =
				await this.student_service.findOneByCondition({
					phone_number: sign_up_with_citizen_dto.phone_number,
				});

			if (first_name == null || last_name == null) {
				throw new ConflictException({
					message: ERRORS_DICTIONARY.STUDENT_NAME_IS_NULL,
					details: 'Name can not be null or empty!!',
				});
			}
			const hashed_password = await bcrypt.hash(
				sign_up_with_citizen_dto.password,
				this.SALT_ROUND,
			);
			const citizen = await this.citizen_service.create({
				first_name,
				last_name,
				phone_number,
				password: hashed_password,
			});

			const refresh_token = this.generateRefreshToken({
				userId: citizen._id.toString(),
				role: 'Student',
			});
			try {
				await this.citizen_service.setCurrentRefreshToken(citizen._id.toString(), refresh_token);
				return {
					access_token: this.generateAccessToken({
						userId: citizen._id.toString(),
						role: 'Citizen',
					}),
					refresh_token,
				};
		} catch (error) {
			console.error(
				'Error storing refresh token or generating access token:',
				error,
			);
			throw new Error(
				'An error occurred while processing tokens. Please try again.',
			);
		}
	}
	catch(error) {
		throw error;
	}
	}

	async verifyOTP(otp: string) {
		if (otp == "000000") {
			return { 
				success: true, 
				message: "OTP Verified Successfully"
			}
		} else {
			throw new HttpException(
				{
				  status: "error",
				  message: "Invalid OTP",
				},
				HttpStatus.BAD_REQUEST, 
			);
		}
	}
}
