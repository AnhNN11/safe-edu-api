import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, HttpException, HttpStatus } from '@nestjs/common';
import { NewService } from './news.service';
import { CreateNewDto } from './dto/create-new.dto';
import { UpdateNewDto } from './dto/update-new.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { IFile } from 'src/interfaces/file.interface';
import { AwsS3Service } from 'src/services/aws-s3.service';
import { News } from './entities/news.entity';

@Controller('news')
@ApiTags('news')
export class NewController {
  constructor(
    private readonly newsService: NewService,
    private readonly awsS3Service: AwsS3Service,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new news'})
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(@Body() createNewsDto: CreateNewDto): Promise<News> {
    return await this.newsService.create(createNewsDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrive all news'})
  async findAll() {
    return await this.newsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrive a news by id'})
  findOneById(@Param('id') id: string) {
    return this.newsService.findOneById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a news by ID' })
  update(@Param('id') id: string, @Body() updateNewDto: UpdateNewDto) {
    return this.newsService.update(id, updateNewDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a news by ID' })
  remove(@Param('id') id: string) {
    return this.newsService.delete(id);
  }

  @Patch(':id/isActive')
  @ApiOperation({ summary: 'Set isActive true' })
  async setIsActiveTrue(@Param('id') id: string) {
    return await this.newsService.setIsActiveTrue(id);
  }
}
