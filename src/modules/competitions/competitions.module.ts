import { Module } from '@nestjs/common';
import { CompetitionsService } from './competitions.service';
import { CompetitionsController } from './competitions.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Competition, CompetitionSchemaFactory } from './entities/competition.entity';
import { CompetitionsRepository } from '@repositories/competition.repository';

@Module({
imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Competition.name,
        useFactory: CompetitionSchemaFactory,
    inject: [],
    imports: [MongooseModule.forFeature([])],
      }
  ])
  ],
  controllers: [CompetitionsController],
  providers: [
    CompetitionsService,
    { provide: 'CompetitionsRepositoryInterface', useClass: CompetitionsRepository },
  ],
  exports: [
    CompetitionsService,
    'CompetitionsRepositoryInterface', 
  ],
})
export class CompetitionsModule {}
