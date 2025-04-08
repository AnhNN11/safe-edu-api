import { Supervisor } from './../supervisors/entities/supervisor.entity';
import { Student } from '@modules/students/entities/student.entity';
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
import { CitizensService } from '@modules/citizens/citizens.service';
import { Citizen } from '@modules/citizens/entities/citizen.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { SignInTokenDto } from './dto/sign-in-token.dto';
import { SupervisorsService } from '@modules/supervisors/supervisors.service';
import * as request from 'supertest';

@Injectable()
export class AuthService {
	private SALT_ROUND = 11;
	constructor(
		private config_service: ConfigService,
		private readonly admin_service: AdminService,
		private readonly student_service: StudentsService,
		private readonly citizen_service: CitizensService,
		private readonly jwt_service: JwtService,
		private readonly mailer_service: MailerService,
		private readonly supervisor_service: SupervisorsService,
	) {}

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

	async authenticateWithGoogle(sign_in_token: SignInTokenDto) {
		// 1. Giải mã token để lấy email
		const {token} = sign_in_token; 
		console.log("token:"+token);
		const decodedToken = this.jwt_service.decode(token) as { email: string };
		console.log("decodedToken:"+decodedToken);
		if (!decodedToken || !decodedToken.email) {
			throw new HttpException(
				{ message: 'Invalid token', error: 'Bad Request' },
				HttpStatus.BAD_REQUEST,
			);
		}
	
		const email = decodedToken.email;
	
		// 2. Kiểm tra email trong cơ sở dữ liệu
		const admin = await this.admin_service.getAdminByEmail(email);
		if (!admin) {
			throw new HttpException(
				{ message: 'User not found', error: 'Unauthorized' },
				HttpStatus.UNAUTHORIZED,
			);
		}
	
		// 3. Sử dụng hàm generateAccessToken và generateRefreshToken
		const accessToken = this.generateAccessToken({
			userId: admin.id,
			role: 'Admin',
		});
	
		const refreshToken = this.generateRefreshToken({
			userId: admin.id,
			role: 'Admin',
		});
	
		// 4. Trả về hai token
		return {
			accessToken,
			refreshToken,
		};
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
				await this.student_service.findOneByCondition({ _id }, 'sign-in'),
				await this.citizen_service.findOneByCondition({ _id }, 'sign-in')
			]);

			if (student) {
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
			} else if (citizen) {
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
			} else {
				throw new BadRequestException({
					message: ERRORS_DICTIONARY.USER_NOT_FOUND,
					details: 'User not found!!',
				});
			}
		} catch (error) {
			throw error
		}
	}

	async signUpWithStudent(sign_up_with_std_dto: SignUpWithStudentDto) {
		try {
			const { first_name, last_name, phone_number, organizationId, otp } =
				sign_up_with_std_dto;

			const [existed_student_phone_number, existed_citizen_phone_number] = await Promise.all([
				await this.student_service.findOneByCondition({ phone_number: sign_up_with_std_dto.phone_number }, 'sign-up'),
				await this.citizen_service.findOneByCondition({ phone_number: sign_up_with_std_dto.phone_number }, 'sign-up')
			]);

			if (existed_student_phone_number) {
				throw new BadRequestException({
					message: ERRORS_DICTIONARY.CITIZEN_PHONE_NUMBER_EXISTS,
					details: 'Phone number already exist',
				});
			}

			if (existed_citizen_phone_number) {
				throw new BadRequestException({
					message: ERRORS_DICTIONARY.CITIZEN_PHONE_NUMBER_EXISTS,
					details: 'Phone number already exist',
				});
			}

			if (otp != "000000") {
				throw new BadRequestException({
					message: 'OTP không đúng',
				});
			}
			
			const student = await this.student_service.create({
				first_name,
				last_name,
				phone_number,
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
			const { first_name, last_name, phone_number, otp } =
			sign_up_with_citizen_dto;
			const [existed_student_phone_number, existed_citizen_phone_number] = await Promise.all([
				await this.student_service.findOneByCondition({ phone_number: sign_up_with_citizen_dto.phone_number }, 'sign-up'),
				await this.citizen_service.findOneByCondition({ phone_number: sign_up_with_citizen_dto.phone_number }, 'sign-up')
			]);
			
			console.log(existed_citizen_phone_number, existed_student_phone_number)

			if (existed_student_phone_number) {
				throw new BadRequestException({
					message: ERRORS_DICTIONARY.CITIZEN_PHONE_NUMBER_EXISTS,
					details: 'Phone number already exist',
				});
			}

			if (existed_citizen_phone_number) {
				throw new BadRequestException({
					message: ERRORS_DICTIONARY.CITIZEN_PHONE_NUMBER_EXISTS,
					details: 'Phone number already exist',
				});
			}

			if (otp != "000000") {
				throw new BadRequestException({
					message: 'OTP không đúng',
				});
			}

			const citizen = await this.citizen_service.create({
				first_name,
				last_name,
				phone_number,
			});

			const refresh_token = this.generateRefreshToken({
				userId: citizen._id.toString(),
				role: 'Citizen',
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

	async sendOtp(phone_number: string): Promise<any> {
		return {
			statusCode: HttpStatus.OK,
			message: `OTP đã được gửi tới sđt ${phone_number} thành công`
		}
	}
	async verifyOTP(otp: string) {
		try {
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
				)
			}
		} catch (error) {
			throw new BadRequestException({
				status: HttpStatus.BAD_REQUEST,
				message: "Có lỗi xảy ra khi xác nhận OTP, vui lòng thử lại sau",
				details: `Có lỗi xảy ra ${error.message}`
			})
		}
		
	}

	sendMail(): void{
		this.mailer_service.sendMail({
			to: 'monkeyold113@gmail.com' ,
			from: 'baopqtde181053@fpt.edu.vn',
			subject: 'Verify email',
			text: 'hello',
			html: '<b>Welcome to Safe Edu</b>'
		})
	}

	async authInWithGoogle(sign_up_dto: SignUpGoogleDto) {
		console.log('auth');
	
		try {
			const results = await Promise.allSettled([
				this.admin_service.findOneByCondition({ email: sign_up_dto.email }),
				this.supervisor_service.findOneByCondition({ email: sign_up_dto.email })
			]);
	
			const admin = results[0].status === "fulfilled" ? results[0].value : null;
			const supervisor = results[1].status === "fulfilled" ? results[1].value : null;
	
			if (admin) {
				return await this.signInAdmin(admin._id.toString());
			}
			if (supervisor) {
				return await this.signInSupervisor(supervisor._id.toString());
			}
	
			throw new Error("User is not an admin or supervisor");
		} catch (error) {
			console.error("Auth error:", error);
			throw error;
		}
	}
	


	async signInAdmin(_id:string){
		const admin =await this.admin_service.findOneByCondition({ _id })
		if(admin)
			{
				console.log("hello" + admin)
				const access_token = this.generateAccessToken({
					userId: admin._id.toString(),
					role: 'Admin',
				});
				const refresh_token = this.generateRefreshToken({
					userId: admin._id.toString(),
					role: 'admin',
				});
				
				return {
					access_token,
					refresh_token,
				};
			} 
	}

	async signInSupervisor(_id:string){
		const supervisor =await this.supervisor_service.findOneByCondition({ _id })
		if(supervisor)
			{
				console.log("hello" + supervisor)
				const access_token = this.generateAccessToken({
					userId: supervisor._id.toString(),
					role: 'supervisor',
				});
				const refresh_token = this.generateRefreshToken({
					userId: supervisor._id.toString(),
					role: 'supervisor',
				});
				
				return {
					access_token,
					refresh_token,
				};
			} 
	}
}
