import { News } from "@modules/news/entities/news.entity";
import { NewsRepositoryInterface } from "@modules/news/interfaces/news.interfaces";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model, Types } from "mongoose";


@Injectable()
export class NewsRepository implements NewsRepositoryInterface {
    constructor(
        @InjectModel(News.name) private readonly newsModel: Model<News>,
    ) {}

    async findOne(condition: FilterQuery<News>): Promise<News | null> {
        return await this.newsModel.findOne(condition)
            .populate('topic_id')
            .exec();
    }

    async create(data: Partial<News>): Promise<News> {
        const newNews = new this.newsModel(data);
        return await newNews.save();
    }

    async findAll() {
        const news = await this.newsModel
		  .find()
          .populate('topic_id')
		  .exec(); 
	  
		const total = await this.newsModel.countDocuments().exec();
		return { items: news, total };
    }

    async update(id: string | Types.ObjectId, updateData: any): Promise<News | null> {
        const stringId = id instanceof Types.ObjectId ? id.toString() : id;
    return this.newsModel.findByIdAndUpdate(stringId, updateData, { new: true }).exec();
    }

    async remove(id: string): Promise<boolean> {
        const result = await this.newsModel.findByIdAndDelete(id).exec();
		return !!result;
    }

    async findById(id: string): Promise<News | null> {
        return await this.newsModel.findById(id).exec();
    }
}