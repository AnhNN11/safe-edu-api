import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TopicsService } from './topic.service';
import { TopicsController } from './topic.controller';
import { Topic, TopicSchemaFactory } from './entities/topic.entity';
import { TopicsRepository } from 'src/repositories/topic.repository';
import { AwsS3Service } from 'src/services/aws-s3.service';
import { GeneratorService } from 'src/services/generator.service';
// Removed the interface import here

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Topic.name,
        useFactory: TopicSchemaFactory,
      },
    ]),
   
  ],
  controllers: [TopicsController],
  providers: [
    TopicsService,
    AwsS3Service,
    GeneratorService,
    { provide: 'TopicsRepositoryInterface', useClass: TopicsRepository },
  ],
  exports: [TopicsService],

})
export class TopicsModule {}
