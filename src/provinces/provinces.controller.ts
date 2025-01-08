import { Controller, Get, Post } from '@nestjs/common';
import { ProvinceService } from './provinces.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller('provinces')
export class ProvinceController {
  constructor(private readonly provinceService: ProvinceService) {}

  @Get()
  async getProvinces() {
    return this.provinceService.getProvinces();
  }

  @Post()
  @ApiOperation({summary: 'Add province into database'})
  async saveProvinceIntoDatabase() {
    return this.provinceService.addProvinceIntoDatabase();
  }
}
