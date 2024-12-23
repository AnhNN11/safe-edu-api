import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { IFile } from 'src/interfaces/file.interface';

import { JwtAccessTokenGuard } from '@modules/auth/guards/jwt-access-token.guard';
import { Public } from 'src/decorators/auth.decorator';
import { TopicsService } from '@modules/topic/topic.service';
import { CreateTopicDto } from '@modules/topic/dto/create-topic.dto';
import { UpdateTopicDto } from '@modules/topic/dto/update-topic.dto';
import { ImageUploadService } from 'src/services/image-upload.service';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { FileUploadDto } from '@modules/topic/dto/file-upload.dto';


@Controller('topics')
export class TopicsController {
  constructor(
    private readonly topicsService: TopicsService,
    private readonly imageUploadService: ImageUploadService,
  ) {}


  @Post('upload-image')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Image upload',
    type: FileUploadDto,
  })
  @Public()
  @UseGuards(JwtAccessTokenGuard)
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(@UploadedFile() image: IFile) {
    try {
      const uploadResult = await this.imageUploadService.uploadImage(image);
      return {
        statusCode: HttpStatus.OK,
        message: 'Image uploaded successfully',
        success: true,
        data: uploadResult,
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

  @Post()
  @Public()
  @UseGuards(JwtAccessTokenGuard)
  async create(@Body() { topic_name, description, image }: CreateTopicDto) {
    try {
      const createTopicDto: CreateTopicDto = { topic_name, description, image };
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


  @Put(':id')
  @Public()
  @UseGuards(JwtAccessTokenGuard)
  async update(
    @Param('id') id: string,
    @Body() { topic_name, description, image }: UpdateTopicDto,
  ) {
    try {
      const updateDto: UpdateTopicDto = { topic_name, description, image };
      const updatedTopic = await this.topicsService.update(id, updateDto);

      return {
        statusCode: HttpStatus.OK,
        message: 'Topic updated successfully',
        success: true,
        data: updatedTopic,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Topic update failed',
          success: false,
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

 
  @Delete(':id')
  @Public()
  @UseGuards(JwtAccessTokenGuard)
  async delete(@Param('id') id: string) {
    return this.topicsService.delete(id);
  }

 
  @Get()
  @Public()
  @UseGuards(JwtAccessTokenGuard)
  async findAll() {
    return this.topicsService.findAll();
  }


  @Get(':id')
  @Public()
  @UseGuards(JwtAccessTokenGuard)
  async findOne(@Param('id') id: string) {
    return this.topicsService.findOne(id);
  }
}
