import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// INNER


// OUTER

import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { Admin, AdminSchemaFactory } from './entities/admin.entity';
import { AdminRepository } from '@repositories/admin.repository';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Admin.name,
        useFactory: AdminSchemaFactory,
      },
    ]),
    
  ],
  controllers: [AdminController],
  providers: [
    AdminService,
    { provide: 'AdminRepositoryInterface', useClass: AdminRepository},
  ],
  exports: [AdminService],
})
export class AdminModule {}
