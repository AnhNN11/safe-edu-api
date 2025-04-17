// import { JwtRefreshTokenStrategy } from './strategies/jwt-refresh-token.strategy';
import { JwtAccessTokenStrategy } from './strategies/jwt-access-token.strategy';
import { JwtRefreshTokenStrategy } from './strategies/jwt-refresh-token.strategy';
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { GoogleStrategy } from './strategies/google.strategy';
import { Student } from '@modules/students/entities/student.entity';
import { StudentsModule } from '@modules/students/students.module';
import { AdminService } from '@modules/admin/admin.service';
import { StudentsService } from '@modules/students/students.service';
import { SupervisorsService } from '@modules/supervisors/supervisors.service';
import { OrganizationsModule } from '@modules/organizations/organizations.module';
import { AdminModule } from '@modules/admin/admin.module';
import { CitizensService } from '@modules/citizens/citizens.service';
import { CitizensModule } from '@modules/citizens/citizens.module';
import { HttpModule } from '@nestjs/axios';
import { MailerModule } from '@nestjs-modules/mailer';
import { SupervisorsModule } from '@modules/supervisors/supervisors.module';
import { ProvincesModule } from 'src/provinces/provinces.module';
@Module({
	imports: [
		StudentsModule,
		AdminModule,
		PassportModule,
		CitizensModule,
		JwtModule.register({}),
		OrganizationsModule,
		CitizensModule,
		HttpModule,
		SupervisorsModule,
		ProvincesModule,
		SupervisorsModule,
		MailerModule.forRoot({
			transport: {
				host: 'smtp.gmail.com',
				auth: {
					user: 'baopqtde181053@fpt.edu.vn',
					pass: 'zpzy mxra zvxa lnzv',
				},
			},
		}),
	],
	controllers: [AuthController],
	providers: [
		AuthService,
		LocalStrategy,
		JwtAccessTokenStrategy,
		JwtRefreshTokenStrategy,
		GoogleStrategy,
		StudentsService,
		AdminService,
		SupervisorsService,
		CitizensService,
		SupervisorsService,
	],
})
export class AuthModule {}
