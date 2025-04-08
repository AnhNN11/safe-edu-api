import { Module } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Quiz, QuizSchemaFactory } from './entities/quiz.entity';

@Module({
   imports: [
      MongooseModule.forFeatureAsync([
        {
          name: Quiz.name,
          useFactory: QuizSchemaFactory,
      inject: [],
      imports: [MongooseModule.forFeature([])],
        }
    ])
    ],
  controllers: [QuizController],
  providers: [QuizService],
})
export class QuizModule {}
