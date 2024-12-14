import { forwardRef, Module } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Organization, OrganizationSchemaFactory, OrganizationsSchema } from './entities/organization.entity';
import { OrganizationsRepository } from '@repositories/organizations.repository';
import { StudentsModule } from '@modules/students/students.module';

@Module({
	imports: [
		MongooseModule.forFeatureAsync([
      {
        name: Organization.name,
        useFactory: OrganizationSchemaFactory,
				inject: [],
				imports: [MongooseModule.forFeature([])],
      }
    ]),
	forwardRef(() => StudentsModule),
	],
	controllers: [OrganizationsController],
	providers: [
		OrganizationsService,
		{ provide: 'OrganizationsRepositoryInterface', useClass: OrganizationsRepository },
	],
	exports: [OrganizationsService],
})
export class OrganizationsModule {}
