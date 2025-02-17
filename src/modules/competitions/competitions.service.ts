import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateCompetitionDto } from './dto/create-competition.dto';
import { UpdateCompetitionDto } from './dto/update-competition.dto';
import { CompetitionsRepository } from '@repositories/competition.repository';
import { ObjectId, Types } from 'mongoose';
import { Competition } from './entities/competition.entity';
import { ERRORS_DICTIONARY } from 'src/constraints/error-dictionary.constraint';

@Injectable()
export class CompetitionsService {
  constructor(
    @Inject('CompetitionsRepositoryInterface')
    private readonly competition_repository: CompetitionsRepository
  ) {}

  async create(createCompetitionDto: CreateCompetitionDto): Promise<Competition> {
    const { title, description, startDate, endDate} = createCompetitionDto;
    const existed_competition = await this.competition_repository.findOne({title});

    if (existed_competition) {
      throw new BadRequestException({
        message: ERRORS_DICTIONARY.COMPETITION_IS_EXIST,
        details: 'Competition already exist',
      })
    }

    if (endDate.getTime < startDate.getTime) {
      throw new BadRequestException({
        message: ERRORS_DICTIONARY.INVALID_END_DATE,
        details: 'Invalid end date'
      })
    }

    const competition =  await this.competition_repository.create({
      title,
      description,
      startDate,
      endDate
    });

    return this.competition_repository.findOne(competition);
  }

  async findAll() {
    return await this.competition_repository.findAll();
  }

  async findById(id: string) {
    return await this.competition_repository.findById(id);
  }

  async update(id: string, updateCompetitionDto: UpdateCompetitionDto): Promise<Competition> {
    console.log("123123123123123123"  + updateCompetitionDto);
    const updated_competition = await this.competition_repository.update(id, {...updateCompetitionDto})

    return await this.competition_repository.findOne(updated_competition);
  }

  async remove(id: string | Types.ObjectId): Promise<Competition | null>  {
    return await this.competition_repository.remove(id);
  }
}
