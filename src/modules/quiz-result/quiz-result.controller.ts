import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	Query,
	UseGuards,
	Req,
} from '@nestjs/common';
import { QuizResultService } from './quiz-result.service';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAccessTokenGuard } from '@modules/auth/guards/jwt-access-token.guard';
import { RolesGuard } from '@modules/auth/guards/roles.guard';

@Controller('quiz-result')
export class QuizResultController {
	constructor(private readonly quizResultService: QuizResultService) {}

	@Get(':id')
	@UseGuards(JwtAccessTokenGuard, RolesGuard)
	getSubmit(@Req() req, @Param('id') id: string) {
		return this.quizResultService.calculateQuizResult(id, req.user.userId);
	}

	@Get()
	@ApiQuery({ name: 'pageNumber', required: false, type: Number })
	@ApiQuery({ name: 'pageSize', required: false, type: Number })
	@ApiQuery({ name: 'searchPhase', required: false, type: String })
	@ApiQuery({ name: 'sortBy', required: false, type: String })
	@ApiQuery({ name: 'sortOrder', required: false, type: String })
	@ApiOperation({ summary: 'Get all submissions' })
	async findAll(
		@Query('searchPhase') searchPhase?: string,
		@Query('pageNumber') pageNumber?: number,
		@Query('pageSize') pageSize?: number,
		@Query('sortBy') sortBy?: string,
		@Query('sortOrder') sortOrder?: 'asc' | 'desc',
	) {
		if (!pageNumber || !pageSize) {
			return await this.quizResultService.findAll();
		}
		return this.quizResultService.findAll(
			searchPhase,
			pageNumber,
			pageSize,
			sortBy,
			sortOrder,
		);
	}

	@Get('/is-submit/:id')
	@UseGuards(JwtAccessTokenGuard, RolesGuard)
	@ApiOperation({ summary: 'check user is submit this quiz' })
	async isDoQuiz(@Param('id') id: string, @Req() req) {
		return this.quizResultService.isDoQuiz(id, req.user.userId);
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.quizResultService.findOne(+id);
	}
}
