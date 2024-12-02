import { Module } from '@nestjs/common';
import { AwsS3Controller } from './aws-s3.controller';
import { GeneratorService } from 'src/services/generator.service';
import { AwsS3Service } from 'src/services/aws-s3.service';

@Module({
	controllers: [AwsS3Controller],
	providers: [GeneratorService, AwsS3Service],
	exports: [AwsS3Service],
})
export class AwsS3Module {}
