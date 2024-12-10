// src/modules/topics/topics.controller.ts

import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { TopicsService } from './topic.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { IFile } from 'src/interfaces/file.interface';
import { log } from 'console';
import { LoggingInterceptor } from 'src/interceptors/logging.interceptor';
import { AwsS3Service } from 'src/services/aws-s3.service';

@Controller('topics')
export class TopicsController {
  constructor(private readonly topicsService: TopicsService,
    private readonly awsS3Service: AwsS3Service
    
  ) {}
  

  @Post()
@UseInterceptors(FileInterceptor('image'))
async uploadImage(
  @UploadedFile() image: IFile,
  @Body() { topic_name, description }: CreateTopicDto,
) {
  try {
    if (!image) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'File is required',
          success: false,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Upload the image to AWS S3
    const uploadResult = await this.awsS3Service.uploadImage(image);

    console.log('Image uploaded:', uploadResult);

    // Construct the DTO with the image URL from AWS S3
    const createTopicDto: CreateTopicDto = {
      topic_name,
      description,
      image: uploadResult, // Assuming `Location` is the key with the uploaded image URL
    };

    // Call the service to create the topic
    const createdTopic = await this.topicsService.create(createTopicDto);

    return {
      statusCode: HttpStatus.OK,
      message: 'Topic created successfully',
      success: true,
      data: createdTopic,
    };
  } catch (error) {
    throw new HttpException(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Topic creation failed',
        success: false,
        error: error.message,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}


  @Get()
  async findAll() {
    return this.topicsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.topicsService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateTopicDto,
  ) {
    return this.topicsService.update(id, updateDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.topicsService.delete(id);
  }
}
