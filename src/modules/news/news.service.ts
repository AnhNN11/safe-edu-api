import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateNewDto } from './dto/create-new.dto';
import { UpdateNewDto } from './dto/update-new.dto';
import { NewsRepository } from '@repositories/news.repository';
import { News } from './entities/news.entity';
import mongoose from 'mongoose';
import { AwsS3Service } from 'src/services/aws-s3.service';
import { TopicsRepository } from '@repositories/topic.repository';
import { TopicsService } from '@modules/topic/topic.service';
import { NewsRepositoryInterface } from './interfaces/news.interfaces';

@Injectable()
export class NewService {
  constructor(
    @Inject('NewsRepositoryInterface')
    private readonly news_repository: NewsRepositoryInterface,
   
  ) {}

  async create(createNewDto: CreateNewDto): Promise<News>{
    try {
      // const category = await this.topic_service.findOne(createNewDto.category_id);

      // if(category) {
      //   const news = await this.news_repository.create({
      //     ...createNewDto,
      //     // category_id: category.id.toString()
      //   })
        // return news;
      }
    catch (error) {
      throw error;
    }
    return this.news_repository.create(createNewDto)
  }

  async findAll() {
    return await this.news_repository.findAll();
  }

  async findOneById(id: string) {
    //check id
    if (mongoose.isValidObjectId(id)) {
      return await this.news_repository.findById(id);
    } else {
      throw new BadRequestException("Invalid id");
    }
  }

  async update(id: string, 
    updateDto: UpdateNewDto
  ): Promise<News> {
    const updatedNews = await this.findOneById(id);



    // Handle image upload if 
    // 
    // a new file is provided
   

    return this.news_repository.update(id, {...updateDto});
  }

  async remove(id: string) {
    //check id 
    if (mongoose.isValidObjectId(id)) {
      return await this.news_repository.remove(id);
    } else {
      throw new BadRequestException("Invalid Id")
    }
  }
}
