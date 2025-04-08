import { Module } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { QuestionsController } from './questions.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Question, QuestionSchemaFactory } from './entities/question.entity';

@Module({
  imports: [
      MongooseModule.forFeatureAsync([
        {
          name: Question.name,
          useFactory: QuestionSchemaFactory,
      inject: [],
      imports: [MongooseModule.forFeature([])],
        }
    ])
    ],
  controllers: [QuestionsController],
  providers: [QuestionsService],
})
export class QuestionsModule {}
