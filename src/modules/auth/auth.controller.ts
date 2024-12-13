import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local.guard';
import { JwtRefreshTokenGuard } from './guards/jwt-refresh-token.guard';
import { SignUpDto } from './dto/sign-up.dto';
import {
	ApiBadRequestResponse,
	ApiBody,
	ApiConflictResponse,
	ApiCreatedResponse,
	ApiOperation,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import { GoogleAuthGuard } from './guards/google-oauth.guard';
import { SignUpWithStudentDto } from './dto/sign-up-with-student.dto';
import { SignUpWithCitizenDto } from './dto/sign-up-with-citizen.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
	constructor(private readonly auth_service: AuthService) {}

	@UseGuards(GoogleAuthGuard)
	@Get('google')
	@ApiResponse({
		status: 401,
		description: 'Unauthorized',
		content: {
			'application/json': {
				example: {
					statusCode: 400,
					message: 'Wrong credentials!!',
					error: 'Bad Request',
				},
			},
		},
	})
	async authWithGoogle() {
		return;
	}

	@UseGuards(GoogleAuthGuard)
	@Get('google/callback')
	@ApiResponse({
		status: 401,
		description: 'Unauthorized',
		content: {
			'application/json': {
				example: {
					statusCode: 400,
					message: 'Wrong credentials!!',
					error: 'Bad Request!',
				},
			},
		},
	})
	async authWithGoogleCallback(@Req() request) {
		return request.user;
	}

	// @UseGuards(JwtRefreshTokenGuard)
	// @Post('refresh')
	// async refreshAccessToken(@Req() request) {
	// 	const { user } = request;
	// 	const access_token = this.auth_service.generateAccessToken({
	// 		user_id: user._id.toString(),
	// 	});
	// 	return {
	// 		access_token,
	// 	};
	// }

	@Get('protected')
	// @UseGuards(JwtAuthGuard)
	async protected(@Req() request) {
		const { user } = request;
		return 'Access protected resource';
	}

	@Post('sign-up-with-student')
	@ApiOperation({ summary: 'sign up with student' })
	async signUpWithStudent(@Body() sign_up_with_std_dto: SignUpWithStudentDto) {
		return await this.auth_service.signUpWithStudent(sign_up_with_std_dto);
	}
}
