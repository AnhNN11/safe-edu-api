import { Module } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Organization, OrganizationSchemaFactory, OrganizationsSchema } from './entities/organization.entity';
import { OrganizationsRepository } from '@repositories/organizations.repository';
import { ManagerService } from '@modules/manager/manager.service';
import { ManagerRepository } from '@repositories/manager.repository';
import { ManagerModule } from '@modules/manager/manager.module';

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
		ManagerModule,
	],
	controllers: [OrganizationsController],
	providers: [
		OrganizationsService,
		{ provide: 'OrganizationsRepositoryInterface', useClass: OrganizationsRepository }
	],
	exports: [
		OrganizationsService,
		'OrganizationsRepositoryInterface', 
	],
})
export class OrganizationsModule {}
