import { forwardRef, Module } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Quiz, QuizSchemaFactory } from './entities/quiz.entity';
import { CompetitionsService } from '@modules/competitions/competitions.service';
import { CompetitionsModule } from '@modules/competitions/competitions.module';

@Module({
	imports: [
		MongooseModule.forFeatureAsync([
			{
				name: Quiz.name,
				useFactory: QuizSchemaFactory,
				inject: [],
				imports: [MongooseModule.forFeature([])],
			},
		]),
		forwardRef(() => CompetitionsModule),
	],
	controllers: [QuizController],
	providers: [QuizService],
})
export class QuizModule {}
