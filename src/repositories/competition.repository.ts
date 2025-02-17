import { BadRequestException, Injectable } from '@nestjs/common';
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
            console.error('Error saving new Competition:', error.message);
            throw new BadRequestException('Failed to create Competition. Please try again.');
          }
    }
    async findAll() {
        const Competitions = await this.competition_model
          .find()
          .exec(); 
      
        const total = await this.competition_model.countDocuments().exec();
        return { items: Competitions, total };
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
}
