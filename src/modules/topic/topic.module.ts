import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TopicsService } from './topic.service';
import { TopicsController } from './topic.controller';
import { Topic, TopicSchemaFactory } from './entities/topic.entity';
import { TopicsRepository } from 'src/repositories/topic.repository';
import { AwsS3Service } from 'src/services/aws-s3.service';
import { GeneratorService } from 'src/services/generator.service';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { UsersModule } from '@modules/users/users.module'; // Import UsersModule
import { UserRolesModule } from '@modules/user-roles/user-roles.module'; // Import UserRolesModule

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Topic.name,
        useFactory: TopicSchemaFactory,
      },
    ]),
    UsersModule, // Import UsersModule để sử dụng UsersService và UsersRepositoryInterface
    UserRolesModule, // Import UserRolesModule để sử dụng UserRolesService và UserRolesRepositoryInterface
  ],
  controllers: [TopicsController],
  providers: [
    TopicsService,
    AwsS3Service,
    GeneratorService,
    RolesGuard,
    { provide: 'TopicsRepositoryInterface', useClass: TopicsRepository },
  ],
  exports: [AwsS3Service],
})
export class TopicsModule {}
