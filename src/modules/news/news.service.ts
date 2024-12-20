import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateNewDto } from './dto/create-new.dto';
import { UpdateNewDto } from './dto/update-new.dto';
import { NewsRepository } from '@repositories/news.repository';
import { News } from './entities/news.entity';
import mongoose from 'mongoose';
import { AwsS3Service } from 'src/services/aws-s3.service';
import { TopicsRepository } from '@repositories/topic.repository';
import { TopicsService } from '@modules/topic/topic.service';
import { ERRORS_DICTIONARY } from 'src/constraints/error-dictionary.constraint';

@Injectable()
export class NewService {
  constructor(
    @Inject('NewsRepositoryInterface')
    private readonly news_repository: NewsRepository,
    private readonly awsS3Service: AwsS3Service,
    private readonly topic_service: TopicsService
  ) {}

  async create(createNewDto: CreateNewDto): Promise<News>{
    return this.news_repository.create(createNewDto)
  }

  async findAll() {
    return await this.news_repository.findAll();
  }

  async findOneById(id: string) {
    const news = await this.news_repository.findById(id);
    if(news) {
      return news;
    } else {
      throw new BadRequestException({
        message: ERRORS_DICTIONARY.NEWS_NOT_FOUND,
        details: 'News not found!!',
    });
    }
  }

  async update(id: string, 
    updateNewDto: UpdateNewDto
  ): Promise<News> {
    const updatedNews = await this.findOneById(id);
    const {title, content, imageUrl, author} = updateNewDto;

    let image_Url = updateNewDto.imageUrl || updatedNews.image_Url;

    // Handle image upload if a new file is provided
    if (typeof updateNewDto.imageUrl !== 'string' && updateNewDto.imageUrl) {
      image_Url = await this.awsS3Service.uploadImage(updateNewDto.imageUrl);
    }

    const updatedNewsData = await this.news_repository.update(id, {
      title,
      content,
      image_Url,
      author
    })
    if(!updatedNewsData) {
      throw new NotFoundException(`News with ID ${id} not found`);
    }
    return updatedNewsData;
  }

  async remove(id: string) {
    //check id 
    if (mongoose.isValidObjectId(id)) {
      return await this.news_repository.update(id, 
        { deleted_at: new Date(),
          isActive: false, 
        }
      );
    } else {
      throw new BadRequestException("Invalid Id")
    }
  }
}
