import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { QuizResultService } from './quiz-result.service';
import { CreateQuizResultDto } from './dto/create-quiz-result.dto';
import { UpdateQuizResultDto } from './dto/update-quiz-result.dto';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';

@Controller('quiz-result')
export class QuizResultController {
  constructor(private readonly quizResultService: QuizResultService) {}

  @Post()
  
  create(@Body() createQuizResultDto: CreateQuizResultDto) {
    return this.quizResultService.calculateQuizResult(
      createQuizResultDto.userId, createQuizResultDto.quizId
    );
  }

  @Get()
  @ApiQuery({ name: 'pageNumber', required: false, type: Number }) 
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'searchPhase', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, type: String })
  @ApiOperation({summary: "Get all submissions"})
  async findAll(
    @Query('searchPhase') searchPhase?: string,
    @Query('pageNumber') pageNumber?: number,
    @Query('pageSize') pageSize?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc'
  ) {
    if (!pageNumber || !pageSize) {
			return await this.quizResultService.findAll();
		}
    return this.quizResultService.findAll(searchPhase, pageNumber, pageSize, sortBy, sortOrder);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quizResultService.findOne(+id);
  }

}
