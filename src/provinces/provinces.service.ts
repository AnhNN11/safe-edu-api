import { Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { ProvinceRepositoryInterface } from './interfaces/provinces.interface';
import { Province } from './entities/province.entity';

@Injectable()
export class ProvinceService {
  private readonly apiUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject('ProvinceRepositoryInterface')
    private readonly provinceRepository: ProvinceRepositoryInterface,
  ) {
    this.apiUrl = this.configService.get<string>('API_PROVINCES_VIETNAM');
  }

  async getProvinces(): Promise<any> {
    try {
      const response$ = this.httpService.get(this.apiUrl);
      const response = await lastValueFrom(response$);
      return response.data;
    } catch (error) {
      throw new Error('Không thể lấy danh sách tỉnh thành');
    }
  }

  async addProvinceIntoDatabase(): Promise<void> {
    const provinces = await this.getProvinces();

    for (const province of provinces) {
      await this.provinceRepository.create({
        name: province.name,
        code: province.code,
        score: province.score,
        matches: province.matches,
      });
    }
  }

  async findOne(_id: string): Promise<Province> {
    return await this.provinceRepository.findOne({_id});
  }

  async findAll() {
    return await this.provinceRepository.findAll()
  }
}