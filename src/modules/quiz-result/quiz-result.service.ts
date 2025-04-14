import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateQuizResultDto } from './dto/create-quiz-result.dto';
import { UpdateQuizResultDto } from './dto/update-quiz-result.dto';
import { Quiz } from '@modules/quiz/entities/quiz.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Submission } from '@modules/submission/entities/submission.entity';
import { QuizResult } from './entities/quiz-result.entity';

@Injectable()
export class QuizResultService {
  constructor(
    @InjectModel(QuizResult.name)
    private readonly quizResultModel: Model<QuizResult>,
    @InjectModel(Submission.name)
    private readonly answerModel: Model<Submission> 
  ){}

  async calculateQuizResult(userId: string, quizId: string) {
    const answers = await this.answerModel.find({ userId, quizId });
    const totalScore = answers.reduce((sum, a) => sum + a.score, 0);
  
    const result = new this.quizResultModel({
      quizId,
      userId,
      totalScore,
      completedAt: new Date(),
    });
  
    await result.save();
    return result;
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
 
    const users = await this.quizResultModel.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ [sortBy]: sortDirection })
       .populate("quiz_id")
       .populate("user_id")
      .exec();
 
    const totalItemCount = await this.quizResultModel.countDocuments(filter).exec();
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

  findOne(id: number) {
    return `This action returns a #${id} quizResult`;
  }

}
