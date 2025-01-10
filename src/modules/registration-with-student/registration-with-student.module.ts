import { Module } from '@nestjs/common';
import { RegistrationWithStudentService } from './registration-with-student.service';
import { RegistrationWithStudentController } from './registration-with-student.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { RegistrationWithStudent, RegistrationWithStudentSchemaFactory } from './entities/registration-with-student.entity';

@Module({
  imports: [
      MongooseModule.forFeatureAsync([
        {
          name: RegistrationWithStudent.name,
          useFactory: RegistrationWithStudentSchemaFactory,
      inject: [],
      imports: [MongooseModule.forFeature([])],
        }
    ])
  ],
  controllers: [RegistrationWithStudentController],
  providers: [RegistrationWithStudentService],
})
export class RegistrationWithStudentModule {}
