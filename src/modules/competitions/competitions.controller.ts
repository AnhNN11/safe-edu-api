import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CompetitionsService } from './competitions.service';
import { CreateCompetitionDto } from './dto/create-competition.dto';
import { UpdateCompetitionDto } from './dto/update-competition.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('competitions')
export class CompetitionsController {
  constructor(private readonly competitionsService: CompetitionsService) {}

  @Post()
  @ApiOperation({summary: 'Create new competition'})
  async create(@Body() createCompetitionDto: CreateCompetitionDto) {
    return this.competitionsService.create(createCompetitionDto);
  }

  @Get()
  @ApiOperation({summary: 'Retrieve all competitions'})
  async findAll() {
    return this.competitionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({summary: 'Find competition by Id'})
  async findById(@Param('id') id: string) {
    return this.competitionsService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({summary: 'Update competition'})
  update(@Param('id') id: string, @Body() updateCompetitionDto: UpdateCompetitionDto) {
    return this.competitionsService.update(id, updateCompetitionDto);
  }

  @Delete(':id')
  @ApiOperation({summary: 'Delete competition (set isActive false)'})
  async remove(@Param('id') id: string) {
    return await this.competitionsService.remove(id);
  }
}
