import { Module } from '@nestjs/common';
import { SubmissionService } from './submission.service';
import { SubmissionController } from './submission.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Submission, SubmissionSchemaFactory } from './entities/submission.entity';

@Module({
  imports: [
      MongooseModule.forFeatureAsync([
        {
          name: Submission.name,
          useFactory: SubmissionSchemaFactory,
      inject: [],
      imports: [MongooseModule.forFeature([])],
        }
    ])
    ],
  controllers: [SubmissionController],
  providers: [SubmissionService],
})
export class SubmissionModule {}
