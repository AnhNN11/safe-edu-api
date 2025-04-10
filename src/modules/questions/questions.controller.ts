import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';

@Controller('questions')
@ApiBearerAuth('token')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Post('/create-question')
  @ApiOperation({summary: "Create a new question"})
  async create(@Body() createQuestionDto: CreateQuestionDto) {
    return this.questionsService.create(createQuestionDto);
  }

  @Get()
  @ApiQuery({ name: 'pageNumber', required: false, type: Number }) 
	@ApiQuery({ name: 'pageSize', required: false, type: Number })
	@ApiQuery({ name: 'searchPhase', required: false, type: String })
	@ApiQuery({ name: 'sortBy', required: false, type: String })
	@ApiQuery({ name: 'sortOrder', required: false, type: String })
  @ApiOperation({summary: "Get all questions"})
  async findAll(
    @Query('searchPhase') searchPhase?: string,
		@Query('pageNumber') pageNumber?: number,
		@Query('pageSize') pageSize?: number,
		@Query('sortBy') sortBy?: string,
		@Query('sortOrder') sortOrder?: 'asc' | 'desc'
  ) {
    if (!pageNumber || !pageSize) {
			return await this.questionsService.findAll();
		}
    return this.questionsService.findAll(searchPhase, pageNumber, pageSize, sortBy, sortOrder);
  }

  @Get(':id')
  @ApiOperation({summary: "Get question by Id"})
  async findOne(@Param('id') id: string) {
    return this.questionsService.findOneById(id);
  }

  @Patch(':id')
  @ApiOperation({summary: "Update question"})
  async update(@Param('id') id: string, @Body() updateQuestionDto: UpdateQuestionDto) {
    return this.questionsService.update(id, updateQuestionDto);
  }

  @Delete(':id')
  @ApiOperation({summary: "Hard delete question by id"})
  async remove(@Param('id') id: string) {
    return this.questionsService.remove(id);
  }

  @Get('get-all-by-quizId/:quizId')
  @ApiOperation({summary: "get all by quiz id"})
  async getAllByQuizId(@Param('quizId') quizId: string) {
    return this.questionsService.getAllByQuizId(quizId)
  }
  
}
