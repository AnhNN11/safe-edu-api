import { Module } from '@nestjs/common';
import { QuizResultService } from './quiz-result.service';
import { QuizResultController } from './quiz-result.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { QuizResult, QuizResultSchemaFactory } from './entities/quiz-result.entity';
import { SubmissionModule } from '@modules/submission/submission.module';

@Module({
  imports: [
        MongooseModule.forFeatureAsync([
          {
            name: QuizResult.name,
            useFactory: QuizResultSchemaFactory,
        inject: [],
        imports: [MongooseModule.forFeature([])],
          }
      ]),
       SubmissionModule,
    ],
  controllers: [QuizResultController],
  providers: [QuizResultService],
})
export class QuizResultModule {}
