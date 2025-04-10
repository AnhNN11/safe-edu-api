import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { Quiz } from './entities/quiz.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class QuizService {
  constructor(
    @InjectModel(Quiz.name)
    private readonly quizModel: Model<Quiz>
  ){}

  async create(createQuizDto: CreateQuizDto) {
    try {
      const quiz = await this.quizModel.create(createQuizDto)
      return quiz;
    } catch (error) {
      throw new BadRequestException({
        status: HttpStatus.BAD_REQUEST,
        message: "Đã có lỗi xảy ra khi tạo phần thi, vui lòng thử lại sau",
        details: `Có lỗi xảy ra khi tạo bộ câu hỏi: ${error.message}`
      })
    }
  }

  async findAll(
    searchPhase: string = '',
		page: number = 1,
		limit: number = 10,
		sortBy: string = 'createdAt',
		sortOrder: 'asc' | 'desc' = 'asc'
  ): Promise<any> {
    try {
      const filter: any = {};
		if (searchPhase) {
			filter.$or = [
				{ name: new RegExp(searchPhase, 'i') },
				{ description: new RegExp(searchPhase, 'i') }
			];
		}

		const validPage = Number(page) > 0 ? Number(page) : 1;
		const validLimit = Number(limit) > 0 ? Number(limit) : 10;
		const skip = (validPage - 1) * validLimit;
		const sortDirection = sortOrder === 'asc' ? 1 : -1;

		const users = await this.quizModel.find(filter)
			.skip(skip)
			.limit(limit)
			.sort({ [sortBy]: sortDirection })
      .populate('competitionId')
			.exec();

		const totalItemCount = await this.quizModel.countDocuments(filter).exec();
		const totalPages = totalItemCount > 0 ? Math.ceil(totalItemCount / validLimit) : 1;
		const itemFrom = totalItemCount === 0 ? 0 : skip + 1;
		const itemTo = Math.min(skip + validLimit, totalItemCount);
		
		const response = {
			items: users,
			totalItemCount: totalItemCount,
			totalPages: totalPages,
			itemFrom: itemFrom,
			itemTo: itemTo
		  };
		
		  return response;
    } catch (error) {
      throw new BadRequestException({
        status: HttpStatus.BAD_REQUEST,
        message: "Đã có lỗi xảy ra trong quá trình xem phần thi, vui lòng thử lại sau",
        details: `Đã có lỗi xảy ra: ${error.message}`
      })
    }
  }

  async findOneById(_id: string): Promise<any>  {
    try {
      const quiz = await this.quizModel.findById(_id)
        .populate('organizationId')
        .exec();

      return quiz;
    } catch (error) {
      throw new BadRequestException({
        status: HttpStatus.BAD_REQUEST,
        message: "Đã có lỗi xảy ra trong lúc tìm kiếm, vui lòng thử lại sau",
        details: `Đã có lỗi xảy ra: ${error.message}`
      })
    }
  }

  async update(_id: string, updateQuizDto: UpdateQuizDto) {
    try {
      const existed_quiz = await this.quizModel.findById(_id).exec();
      if (!existed_quiz) {
        throw new BadRequestException({
          status: HttpStatus.BAD_REQUEST,
          message: "Không tìm thấy câu hỏi để cập nhật, vui lòng thử lại sau",
        })
      }

      const update_question =  await this.quizModel.findByIdAndUpdate(
        _id, 
        {...updateQuizDto}
      )
    } catch (error) {
      throw new BadRequestException({
        status: HttpStatus.BAD_REQUEST,
        message: "Đã có lỗi xảy ra trong lúc cập nhật, vui lòng thử lại sau",
        details: `Đã có lỗi xảy ra: ${error.message}`
      })
    }
  }

  async remove(_id: string) {
    try {
      const existed_quiz = await this.quizModel.findById(_id).exec();
      if (!existed_quiz) {
        throw new BadRequestException({
          status: HttpStatus.BAD_REQUEST,
          message: "Không tìm thấy phần thi này",
        })
      }
      
      await this.quizModel.findByIdAndDelete(_id);
    } catch (error) {
      throw new BadRequestException({
        status: HttpStatus.BAD_REQUEST,
        message: "Đã có lỗi xảy ra trong lúc xóa, vui lòng thử lại sau",
        details: `Đã có lỗi xảy ra: ${error.message}`
      })
    }
  }

  async getAllByCompetitionId(competitionId: string) {
    try {
      const quiz = await this.quizModel.find({ competitionId: competitionId })
        .populate('competitionId')
        .exec();
  
      return {
        data: quiz,
      };
    } catch (error) {
      throw new BadRequestException({
        status: HttpStatus.BAD_REQUEST,
        message: 'Đã có lỗi xảy ra khi lấy câu hỏi theo cuộc thi',
        details: `Lỗi: ${error.message}`,
      });
    }
  }
}
