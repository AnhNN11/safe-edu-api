import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CitizensService } from './Citizens.service';
import { CreateCitizenDto } from './dto/create-Citizen.dto';
import { UpdateCitizenDto } from './dto/update-Citizen.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAccessTokenGuard } from '@modules/auth/guards/jwt-access-token.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Citizen } from './entities/Citizen.entity';

@Controller('Citizens')
@ApiTags('Citizens')
@ApiBearerAuth('token')
export class CitizensController {
  constructor(private readonly CitizensService: CitizensService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new Citizen' })
  async create(@Body() createCitizenDto: CreateCitizenDto) {
    return await this.CitizensService.create(createCitizenDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all Citizens' })
  @UseGuards(JwtAccessTokenGuard, RolesGuard)
  async findAll() {
    return await this.CitizensService.findAll();
  }

  @Get(':id')
	@ApiOperation({ summary: 'Retrieve a user by ID' })
	async findOne(@Param('id') _id: string): Promise<Citizen> {
  return await this.CitizensService.findOneByCondition({ _id });
	}

  @Patch(':id')
  @ApiOperation({ summary: 'Update a Citizen by ID' })
  async update(
		@Param('id') id: string,
		@Body() updateCitizenDto: UpdateCitizenDto,
	): Promise<Citizen> {
		return await this.CitizensService.update(id, updateCitizenDto);
	}

  @Delete(':id')
	@ApiOperation({ summary: 'Delete a Citizen by ID' })
	@UseGuards(JwtAccessTokenGuard, RolesGuard)
	async remove(@Param('id') id: string): Promise<void> {
		await this.CitizensService.remove(id);
	}

  @Get(':phone_number')
	@ApiOperation({ summary: 'Retrieve a user by phone_number' })
	async findOneByPhoneNumber(@Param('phone_number') phone_number: string): Promise<Citizen> {
		return await this.CitizensService.findOneByCondition({ phone_number });
	}

}
