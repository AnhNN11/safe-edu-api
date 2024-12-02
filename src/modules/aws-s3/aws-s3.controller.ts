import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
	Body,
	Controller,
	Delete,
	Get,
	HttpException,
	HttpStatus,
	Param,
	Post,
	UploadedFile,
	UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';

import { IFile } from 'src/interfaces/file.interface';
import { AwsS3Service } from 'src/services/aws-s3.service';

@ApiTags('AWS S3')
@Controller('aws-s3')
export class AwsS3Controller {
	constructor(private readonly awsS3Service: AwsS3Service) {}

	@Post('upload')
	@UseInterceptors(FileInterceptor('file'))
	async uploadImage(@UploadedFile() file: IFile) {
		try {
			console.log(file);
			const result = await this.awsS3Service.uploadImage(file);

			console.log(result);

			return {
				statusCode: HttpStatus.OK,
				message: 'Image uploaded successfully',
				success: true,
				data: result,
			};
		} catch (error) {
			throw new HttpException(
				{
					statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
					message: 'Image upload failed',
					success: false,
					error: error.message,
				},
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	@Get('signed-url/:key')
	async getSignedUrl(@Param('key') key: string) {
		const url = await this.awsS3Service.getSignedUrl(key);
		return { url };
	}

	@Delete('delete/:key')
	async deleteObject(@Param('key') key: string) {
		await this.awsS3Service.deleteObject(key);
		return { message: 'Object deleted successfully' };
	}

	@Delete('delete-multiple')
	async deleteObjects(@Body('keys') keys: string[]) {
		await this.awsS3Service.deleteObjects(keys);
		return { message: 'Objects deleted successfully' };
	}
}
