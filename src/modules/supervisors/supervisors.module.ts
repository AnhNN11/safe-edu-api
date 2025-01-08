import { Module } from '@nestjs/common';
import { SupervisorsService } from './supervisors.service';
import { SupervisorsController } from './supervisors.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Supervisor, SupervisorSchemaFactory } from './entities/supervisor.entity';
import { OrganizationsModule } from '@modules/organizations/organizations.module';
import { OrganizationsService } from '@modules/organizations/organizations.service';
import { OrganizationsRepository } from '@repositories/organizations.repository';
import { SupervisorRepository } from '@repositories/supervisor.repository';
import { ProvincesModule } from 'src/provinces/provinces.module';
import { ProvinceService } from 'src/provinces/provinces.service';
import { ProvinceRepository } from '@repositories/province.repository';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
      MongooseModule.forFeatureAsync([
        {
          name: Supervisor.name,
          useFactory: SupervisorSchemaFactory,
          inject: [],
          imports: [MongooseModule.forFeature([])],
        },
      ]),
      ProvincesModule,
      HttpModule,
    ],
  controllers: [SupervisorsController],
  providers: [
    SupervisorsService,
    { provide: 'SupervisorRepositoryInterface', useClass: SupervisorRepository},
  ],
  exports: [SupervisorsService,
    'SupervisorRepositoryInterface'
  ],
})
export class SupervisorsModule {}
