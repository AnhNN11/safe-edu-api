import { Module } from '@nestjs/common';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';

// INNER

import { TestController } from './test.controller';

import { UsersRepository } from '@repositories/users.repository';

// OUTER
import { UserRolesModule } from '@modules/user-roles/user-roles.module';
import { Test, TestSchema, TestSchemaFactory } from './entities/test.entity';
import { TestService } from './test.service';
import { TestRepository } from '@repositories/test.repository';

@Module({
	imports: [
		MongooseModule.forFeatureAsync([
			{
				name: Test.name,
				useFactory: TestSchemaFactory,
				inject: [],
				imports: [MongooseModule.forFeature([])],
			},
		]),
		UserRolesModule,
	],
	controllers: [TestController],
	providers: [
		TestService,
		{ provide: 'TestRepositoryInterface', useClass: TestRepository },
	],
	exports: [TestService],
})
export class TestModule {}
