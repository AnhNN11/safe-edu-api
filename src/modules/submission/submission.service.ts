import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { Model } from 'mongoose';
import { Submission } from './entities/submission.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Citizen } from '@modules/citizens/entities/citizen.entity';
import { Student } from '@modules/students/entities/student.entity';
import { ERRORS_DICTIONARY } from 'src/constraints/error-dictionary.constraint';

@Injectable()
export class SubmissionService {
  constructor(
    @InjectModel(Submission.name)
    private readonly submissionModel: Model<Submission>,
    @InjectModel(Citizen.name)
    private readonly citizenModel: Model<Citizen>,
    @InjectModel(Student.name)
    private readonly studentModel: Model<Student> 
  ){}

  async create(createSubmissionDto: CreateSubmissionDto) {
    try {
      const { user_id, question_id } = createSubmissionDto

      const [existed_phone_number_student, existed_phone_number_student_citizen] =
			await Promise.all([
				await this.citizenModel.findById(user_id),
				await this.studentModel.findById(user_id),
			]);

      if (!existed_phone_number_student || !existed_phone_number_student_citizen) {
            throw new BadRequestException({
              message: "Người dùng không tồn tại",
            });
        }

    } catch (error) {
       throw new BadRequestException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: error.message,
       })
    }
  }

  findAll() {
    return `This action returns all submission`;
  }

  findOne(id: number) {
    return `This action returns a #${id} submission`;
  }

  update(id: number, updateSubmissionDto: UpdateSubmissionDto) {
    return `This action updates a #${id} submission`;
  }

  remove(id: number) {
    return `This action removes a #${id} submission`;
  }
}
