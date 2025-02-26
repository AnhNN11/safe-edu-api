import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { CompetitionsService } from './competitions.service';
import { CreateCompetitionDto } from './dto/create-competition.dto';
import { UpdateCompetitionDto } from './dto/update-competition.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAccessTokenGuard } from '@modules/auth/guards/jwt-access-token.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { RolesEnum } from 'src/enums/roles..enum';

@Controller('competitions')
@UseGuards(JwtAccessTokenGuard, RolesGuard)
export class CompetitionsController {
  constructor(private readonly competitionsService: CompetitionsService) {}

  @Post()
  @ApiOperation({summary: 'Create new competition'})
  async create(@Body() createCompetitionDto: CreateCompetitionDto, @Request() req) {
    return this.competitionsService.create(createCompetitionDto, req.user?.userId);
  }

  @Get()
  @Roles(RolesEnum.ADMIN)
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
