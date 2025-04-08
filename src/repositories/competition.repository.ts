import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { Competition } from '../modules/competitions/entities/competition.entity';
import { CompetitionsRepositoryInterface } from '@modules/competitions/interfaces/competition.interface';

@Injectable()
export class CompetitionsRepository implements CompetitionsRepositoryInterface {
    constructor(
        @InjectModel(Competition.name) private readonly competition_model: Model<Competition>,
    ) {}
    async findOne(condition: FilterQuery<Competition>): Promise<Competition | null> {
        return await this.competition_model.findOne(condition)
        .exec(); 
    }

    async create(data: Partial<Competition>): Promise<Competition> {
        try {
            const newCompetition = new this.competition_model(data);
            const savedCompetition = await newCompetition.save();
            return savedCompetition;
          } catch (error) {
            throw new BadRequestException({
                status: HttpStatus.BAD_REQUEST,
                message: "Đã có lỗi xảy ra khi tạo cuộc thi, vui lòng thử lại sau",
                details: `Có lỗi xảy ra khi tạo cuộc thi: ${error.message}`
            });
        }
    }
    async findAll(
        searchPhase: string = '',
        page: number = 1,
        limit: number = 10,
        sortBy: string = 'createdAt',
        sortOrder: 'asc' | 'desc' = 'asc'
    ): Promise<any> {
    try {
        const filter: any = {};
        if (searchPhase) {
            filter.$or = [
                { name: new RegExp(searchPhase, 'i') },
                { description: new RegExp(searchPhase, 'i') }
            ];
        }

        const validPage = Number(page) > 0 ? Number(page) : 1;
        const validLimit = Number(limit) > 0 ? Number(limit) : 10;
        const skip = (validPage - 1) * validLimit;
        const sortDirection = sortOrder === 'asc' ? 1 : -1;

        const users = await this.competition_model.find(filter)
            .skip(skip)
            .limit(limit)
            .sort({ [sortBy]: sortDirection })
            .exec();

        const totalItemCount = await this.competition_model.countDocuments(filter).exec();
        const totalPages = totalItemCount > 0 ? Math.ceil(totalItemCount / validLimit) : 1;
        const itemFrom = totalItemCount === 0 ? 0 : skip + 1;
        const itemTo = Math.min(skip + validLimit, totalItemCount);
        
        const response = {
            items: users,
            totalItemCount: totalItemCount,
            totalPages: totalPages,
            itemFrom: itemFrom,
            itemTo: itemTo
            };
        
            return response;
    } catch (error) {
        throw new BadRequestException({
        status: HttpStatus.BAD_REQUEST,
        message: "Đã có lỗi xảy ra trong quá trình xem cuộc thi, vui lòng thử lại sau",
        details: `Đã có lỗi xảy ra: ${error.message}`
        })
    }
    }
    

    async update(id: string, data: Partial<Competition>): Promise<Competition | null> {
        return await this.competition_model.findByIdAndUpdate(id, data, { new: true }).exec();
    }

    async findById(id: string) {
        return await this.competition_model.findById(id).exec();
    }

    async remove(id: string | Types.ObjectId): Promise<Competition | null> {
        const stringId = id instanceof Types.ObjectId ? id.toString() : id;
        return this.competition_model.findByIdAndUpdate(stringId, 
                { deleted_at: new Date(), isActive: false }, 
                { new: true },
            )
            .exec();
    }

    async findBySlug(slug: string): Promise<Competition> {
        const competition = await this.competition_model.findOne({slug})
        if (!competition) {
            throw new BadRequestException({
                status: HttpStatus.BAD_REQUEST,
                message: "Đã có lỗi xảy ra trong lúc tìm kiếm, vui lòng thử lại sau",
            })
        }
        return competition;
    }
}
