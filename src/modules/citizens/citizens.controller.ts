import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	UseGuards,
	Request,
} from '@nestjs/common';
import { CitizensService } from './citizens.service';
import { CreateCitizenDto } from './dto/create-citizen.dto';
import { UpdateCitizenDto } from './dto/update-citizen.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAccessTokenGuard } from '@modules/auth/guards/jwt-access-token.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Citizen } from './entities/citizen.entity';
import { RolesEnum } from 'src/enums/roles..enum';
import { Roles } from 'src/decorators/roles.decorator';
@Controller('Citizens')
@ApiTags('Citizens')
@ApiBearerAuth('token')
@UseGuards(JwtAccessTokenGuard, RolesGuard)
export class CitizensController {
	constructor(private readonly CitizensService: CitizensService) {}

	@Post()
	@Roles(RolesEnum.ADMIN)
	@ApiOperation({ summary: 'Create a new Citizen' })
	async create(
		@Body() createCitizenDto: CreateCitizenDto,
		@Request() req,
	): Promise<Citizen> {
		console.log(req.user);
		return await this.CitizensService.create(createCitizenDto);
	}

	@Get()
	@ApiOperation({ summary: 'Retrieve all Citizens' })
	async findAll() {
		return await this.CitizensService.findAll();
	}

	@Get(':id')
	@ApiOperation({ summary: 'Retrieve a user by ID' })
	async findOne(@Param('id') _id: string, action: string): Promise<Citizen> {
		return await this.CitizensService.findOneByCondition({ _id }, action);
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
	async remove(@Param('id') id: string): Promise<void> {
		await this.CitizensService.delete(id);
	}

	@Get(':phone_number')
	@ApiOperation({ summary: 'Retrieve a user by phone_number' })
	async findOneByPhoneNumber(
		@Param('phone_number') phone_number: string,
		action: string,
	): Promise<Citizen> {
		return await this.CitizensService.findOneByCondition(
			{ phone_number },
			action,
		);
	}

	@Patch(':id/isActive')
	@ApiOperation({summary: 'Set isAcitive: true'})
	async setIsActiveTrue(@Param('id') id: string): Promise<Citizen> {
		return await this.CitizensService.setIsActiveTrue(id);
	}

	@Post(':id/status/:status')
	@ApiOperation({ summary: 'like status' })
	async updateLikeStatus(
			@Param('id') id: string,
			@Param('status') status: 'like' | 'dislike',
		): Promise<{ id: string; status: string }> {
			return { id, status };
	}

	@Post(':id/option/:option')
	@ApiOperation({summary: 'report chat'})
	async reportChat(
		@Param('id') id: string,
		@Param('option') option: string,): Promise<{ id: string; option: string }> {
		return { id, option };
	}
}
