import { forwardRef, Module } from '@nestjs/common';
import { QuizResultService } from './quiz-result.service';
import { QuizResultController } from './quiz-result.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
	QuizResult,
	QuizResultSchemaFactory,
} from './entities/quiz-result.entity';
import { SubmissionModule } from '@modules/submission/submission.module';
import { QuestionsService } from '@modules/questions/questions.service';
import { QuestionsModule } from '@modules/questions/questions.module';

@Module({
	imports: [
		MongooseModule.forFeatureAsync([
			{
				name: QuizResult.name,
				useFactory: QuizResultSchemaFactory,
				inject: [],
				imports: [MongooseModule.forFeature([])],
			},
		]),
		QuestionsModule,
		SubmissionModule,
	],
	controllers: [QuizResultController],
	providers: [QuizResultService, QuestionsService],
	exports: [QuizResultService],
})
export class QuizResultModule {}
