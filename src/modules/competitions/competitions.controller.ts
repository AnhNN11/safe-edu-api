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
	Query,
} from '@nestjs/common';
import { CompetitionsService } from './competitions.service';
import { CreateCompetitionDto } from './dto/create-competition.dto';
import { UpdateCompetitionDto } from './dto/update-competition.dto';
import {
	ApiBearerAuth,
	ApiOperation,
	ApiQuery,
	ApiTags,
} from '@nestjs/swagger';
import { JwtAccessTokenGuard } from '@modules/auth/guards/jwt-access-token.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { RolesEnum } from 'src/enums/roles..enum';

@Controller('competitions')
// @UseGuards(JwtAccessTokenGuard, RolesGuard)
@ApiBearerAuth('token')
export class CompetitionsController {
	constructor(private readonly competitionsService: CompetitionsService) {}

	@Post()
	@ApiOperation({ summary: 'Create new competition' })
	async create(@Body() createCompetitionDto: CreateCompetitionDto) {
		return this.competitionsService.create(createCompetitionDto);
	}

	@Get()
	@ApiQuery({ name: 'pageNumber', required: false, type: Number })
	@ApiQuery({ name: 'pageSize', required: false, type: Number })
	@ApiQuery({ name: 'searchPhase', required: false, type: String })
	@ApiQuery({ name: 'sortBy', required: false, type: String })
	@ApiQuery({ name: 'sortOrder', required: false, type: String })
	// @Roles(RolesEnum.ADMIN)
	@ApiOperation({ summary: 'Retrieve all competitions' })
	async findAll(
		@Query('searchPhase') searchPhase?: string,
		@Query('pageNumber') pageNumber?: number,
		@Query('pageSize') pageSize?: number,
		@Query('sortBy') sortBy?: string,
		@Query('sortOrder') sortOrder?: 'asc' | 'desc',
	) {
		if (!pageNumber || !pageSize) {
			return await this.competitionsService.findAll();
		}
		return this.competitionsService.findAll(
			searchPhase,
			pageNumber,
			pageSize,
			sortBy,
			sortOrder,
		);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Find competition by Id' })
	async findById(@Param('id') id: string) {
		return this.competitionsService.findById(id);
	}

	@Patch(':id')
	@ApiOperation({ summary: 'Update competition' })
	update(
		@Param('id') id: string,
		@Body() updateCompetitionDto: UpdateCompetitionDto,
	) {
		return this.competitionsService.update(id, updateCompetitionDto);
	}

	@Delete(':id')
	@ApiOperation({ summary: 'Delete competition (set isActive false)' })
	async remove(@Param('id') id: string) {
		return await this.competitionsService.remove(id);
	}

	@Get('/slug/:slug')
	@ApiOperation({ summary: 'Find by slug' })
	async findBySlug(@Param('slug') slug: string) {
		return await this.competitionsService.findBySlug(slug);
	}

	@Get('/leaderboard/:slug')
	@ApiOperation({ summary: 'Find by slug' })
	async getLeaderBoadBySlug(@Param('slug') slug: string) {
		return await this.competitionsService.findleaderBoadBySlug(slug);
	}
	@Get('/get-all-quiz-by-slug/:slug')
	@ApiOperation({ summary: 'get all by competition id' })
	async getAllBySlug(@Param('slug') slug: string) {
		return this.competitionsService.getAllBySlug(slug);
	}
}
