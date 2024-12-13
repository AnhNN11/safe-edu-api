import { BaseEntity } from '@modules/shared/base/base.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Model } from 'mongoose';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { NextFunction } from 'express';

export type CompetitionDocument = HydratedDocument<Competition>;

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  toJSON: {
    getters: true,
    virtuals: true,
  },
})
export class Competition extends BaseEntity {
  constructor(competition: {
    title?: string;
    description?: string;
    startDate?: Date;
    endDate?: Date;
    _image?: string;
    video?: string;
    isActive?: boolean;
    status?: 'Upcoming' | 'Ongoing' | 'Completed';
  }) {
    super();
    this.title = competition?.title;
    this.description = competition?.description;
    this.startDate = competition?.startDate;
    this.endDate = competition?.endDate;
    this._image = competition?._image;
    this.video = competition?.video;
    this.isActive = competition?.isActive ?? true;
    this.status = competition?.status || 'Upcoming';
  }

  @Prop({
    required: true,
    minlength: 5,
    maxlength: 100,
    set: (title: string) => title.trim(),
  })
  title: string;

  @Prop({
    maxlength: 500,
    set: (description: string) => description.trim(),
  })
  description: string;

  @Prop({
    required: true,
    type: Date,
  })
  startDate: Date;

  @Prop({
    required: true,
    type: Date,
  })
  endDate: Date;

  @Prop({
    default: 'https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png',
  })
  _image: string;

  @Prop({
    type: String,
  })
  video?: string;

  @Prop({
    type: Boolean,
    default: true,
  })
  isActive: boolean;

  @Prop({
    required: true,
    enum: ['Upcoming', 'Ongoing', 'Completed'],
    default: 'Upcoming',
  })
  status: 'Upcoming' | 'Ongoing' | 'Completed';
}

export const CompetitionSchema = SchemaFactory.createForClass(Competition);

export const CompetitionSchemaFactory = () => {
  const competitionSchema = CompetitionSchema;

  competitionSchema.pre('findOneAndDelete', async function (next: NextFunction) {
    const competition = await this.model.findOne(this.getFilter());

    return next();
  });

  return competitionSchema;
};
