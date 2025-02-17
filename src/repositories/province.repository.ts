import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, ObjectId, Types } from 'mongoose';
import { Province } from 'src/provinces/entities/province.entity';
import { ProvinceRepositoryInterface } from 'src/provinces/interfaces/provinces.interface';

@Injectable()
export class ProvinceRepository implements ProvinceRepositoryInterface {
  constructor(
    @InjectModel(Province.name) private readonly provinceModel: Model<Province>,
  ) {}

  async create(data: Partial<Province>): Promise<Province> {
    console.log('data:', JSON.stringify(data, null, 2));
    
    try {
        const newProvince = new this.provinceModel(data);
        const savedProvince = await newProvince.save();
        return savedProvince;
        } catch (error) {
        console.error('Error saving new province:', error.message);
        throw new BadRequestException('Failed to create province. Please try again.');
    }
  }

  async findAll() {
    const provinces = await this.provinceModel
        .find()
        .exec();
    const total = await this.provinceModel.countDocuments().exec();
    return { items: provinces, total };
  }

  async update(id: string, data: Partial<Province>): Promise<Province | null> {
      return await this.provinceModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async remove(id: string | Types.ObjectId): Promise<Province> {
      const stringId = id instanceof Types.ObjectId ? id.toString() : id;
      return this.provinceModel.findByIdAndUpdate(stringId, { deleted_at: new Date(), isActive: false }, { new: true }).exec();
  }

  async findOne(condition: FilterQuery<Province>): Promise<Province | null> {
      return await this.provinceModel.findOne(condition).exec();
  }
}
