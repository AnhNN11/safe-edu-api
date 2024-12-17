import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// INNER

// OUTER
import { OrganizationsService } from '@modules/organizations/organizations.service';
import { OrganizationsRepository } from '@repositories/organizations.repository';
import { OrganizationsModule } from '@modules/organizations/organizations.module';
import { Citizen, CitizenSchemaFactory } from './entities/citizen.entity';
import { CitizensController } from './citizens.controller';
import { CitizensService } from './citizens.service';
import { AuthService } from '@modules/auth/auth.service';
import { CitizensRepository } from '@repositories/citizen.repository';

@Module({
	imports: [
		MongooseModule.forFeatureAsync([
			{
				name: Citizen.name,
				useFactory: CitizenSchemaFactory,
				inject: [],
				imports: [MongooseModule.forFeature([])],
			},
		]),
		OrganizationsModule,
	],
	controllers: [CitizensController],
	providers: [
		CitizensService,
		{ provide: 'CitizensRepositoryInterface', useClass: CitizensRepository },
	],
	exports: [CitizensService,
		'CitizensRepositoryInterface',
	],
})
export class CitizensModule {}
