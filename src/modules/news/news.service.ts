import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateNewDto } from './dto/create-new.dto';
import { UpdateNewDto } from './dto/update-new.dto';
import { NewsRepository } from '@repositories/news.repository';
import { News } from './entities/news.entity';
import mongoose from 'mongoose';
import { AwsS3Service } from 'src/services/aws-s3.service';

@Injectable()
export class NewService {
  constructor(
    @Inject('NewsRepositoryInterface')
    private readonly news_repository: NewsRepository,
    private readonly awsS3Service: AwsS3Service,
  ) {}

  async create(createNewDto: CreateNewDto): Promise<News> {
    try {
      return await this.news_repository.create({
        ...createNewDto
      })
    } catch (err) {
      throw new Error(`Failed to create news: ${err.message}`);
    }
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
    updateNewDto: UpdateNewDto
  ): Promise<News> {
    const updatedNews = await this.findOneById(id);

    let imageUrl = updateNewDto.imageUrl || updatedNews.imageUrl;

    // Handle image upload if a new file is provided
    if (typeof updateNewDto.imageUrl !== 'string' && updateNewDto.imageUrl) {
      imageUrl = await this.awsS3Service.uploadImage(updateNewDto.imageUrl);
    }

    const updatedCategoryData = {
      ...updateNewDto,
      image: imageUrl,
    };
    return updatedNews;
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
