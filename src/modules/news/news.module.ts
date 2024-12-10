import { Module } from '@nestjs/common';
import { NewService } from './news.service';
import { NewController } from './news.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { News, NewsSchemaFactory } from './entities/news.entity';
import { NewsRepository } from '@repositories/news.repository';
import { AwsS3Service } from 'src/services/aws-s3.service';
import { GeneratorService } from 'src/services/generator.service';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([{
      name: News.name,
      useFactory: NewsSchemaFactory,
        inject: [],
        imports: [MongooseModule.forFeature([])],
    }])
  ],
  controllers: [NewController],
  providers: [
    NewService,
    AwsS3Service,
    GeneratorService,
    { provide: 'NewsRepositoryInterface', useClass: NewsRepository}
  ],
  exports: [AwsS3Service],
})
export class NewsModule {}
