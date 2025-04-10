import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Question } from './entities/question.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectModel(Question.name)
    private readonly questionModel: Model<Question> 
  ){}

  async create(createQuestionDto: CreateQuestionDto): Promise<any> {
    try {
      const question = await this.questionModel.create(createQuestionDto)
      return question;
    } catch (error) {
      throw new BadRequestException({
        status: HttpStatus.BAD_REQUEST,
        message: "Đã có lỗi xảy ra khi tạo câu hỏi, vui lòng thử lại sau",
        details: `Có lỗi xảy ra khi tạo câu hỏi: ${error.message}`
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

		const users = await this.questionModel.find(filter)
			.skip(skip)
			.limit(limit)
			.sort({ [sortBy]: sortDirection })
      .populate("quiz_id")
			.exec();

		const totalItemCount = await this.questionModel.countDocuments(filter).exec();
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
        message: "Đã có lỗi xảy ra trong quá trình xem câu hỏi, vui lòng thử lại sau",
        details: `Đã có lỗi xảy ra: ${error.message}`
      })
    }
  }

  async findOneById(_id: string): Promise<any> {
    try {
      const question = await this.questionModel
      .findById(_id)
      .populate("quiz_id")
      .exec();

      return question;
    } catch (error) {
      throw new BadRequestException({
        status: HttpStatus.BAD_REQUEST,
        message: "Đã có lỗi xảy ra trong lúc tìm kiếm, vui lòng thử lại sau",
        details: `Đã có lỗi xảy ra: ${error.message}`
      })
    }
  }

  async update(_id: string, updateQuestionDto: UpdateQuestionDto): Promise<any> {
    try {
      const existed_question = await this.questionModel.findById(_id).exec();
      if (!existed_question) {
        throw new BadRequestException({
          status: HttpStatus.BAD_REQUEST,
          message: "Không tìm thấy câu hỏi để cập nhật, vui lòng thử lại sau",
        })
      }

      await this.questionModel.findByIdAndUpdate(
        _id, 
        {...updateQuestionDto}
      )
      
      const updated_question = await this.questionModel.findOne({_id})
      return updated_question

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
      const existed_question = await this.questionModel.findById(_id).exec();
      await this.questionModel.findByIdAndDelete(_id);
    } catch (error) {
      throw new BadRequestException({
        status: HttpStatus.BAD_REQUEST,
        message: "Đã có lỗi xảy ra trong lúc xóa, vui lòng thử lại sau",
        details: `Đã có lỗi xảy ra: ${error.message}`
      })
    }
  }

  async getAllByQuizId(quizId: string) {
    try {
      const questions = await this.questionModel.find({ quiz_id: quizId })
        .populate('quiz_id')
        .exec();
  
      return {
        status: HttpStatus.OK,
        message: 'Lấy danh sách câu hỏi theo quiz thành công',
        data: questions,
      };
    } catch (error) {
      throw new BadRequestException({
        status: HttpStatus.BAD_REQUEST,
        message: 'Đã có lỗi xảy ra khi lấy câu hỏi theo quiz',
        details: `Lỗi: ${error.message}`,
      });
    }
  }

}
