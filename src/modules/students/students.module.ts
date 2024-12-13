import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// INNER

// OUTER
import { OrganizationsService } from '@modules/organizations/organizations.service';
import { OrganizationsRepository } from '@repositories/organizations.repository';
import { OrganizationsModule } from '@modules/organizations/organizations.module';
import { Student, StudentSchemaFactory } from './entities/student.entity';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { StudentsRepository } from '@repositories/student.repository';

@Module({
	imports: [
		MongooseModule.forFeatureAsync([
			{
				name: Student.name,
				useFactory: StudentSchemaFactory,
				inject: [],
				imports: [MongooseModule.forFeature([])],
			},
		]),
		OrganizationsModule
	],
	controllers: [StudentsController],
	providers: [
		StudentsService,
		{ provide: 'StudentsRepositoryInterface', useClass: StudentsRepository },
	],
	exports: [StudentsService], 
})
export class StudentsModule {}
