import { BaseEntity } from '@modules/shared/base/base.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Model } from 'mongoose';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { NextFunction } from 'express';

export type AchievementDocument = HydratedDocument<Achievement>;

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
export class Achievement extends BaseEntity {
  constructor(achievement: {
    title?: string;
    description?: string;
    _image?: string;
    isActive?: boolean;
    createdBy?: mongoose.Types.ObjectId;
    updatedBy?: mongoose.Types.ObjectId;
  }) {
    super();
    this.title = achievement?.title;
    this.description = achievement?.description;
    this._image = achievement?._image;
    this.isActive = achievement?.isActive;
    this.createdBy = achievement?.createdBy;
    this.updatedBy = achievement?.updatedBy;
  }

  @Prop({
    required: true,
    minlength: 2,
    maxlength: 100,
    set: (title: string) => title.trim(),
  })
  title: string;

  @Prop({
    required: false,
    set: (description: string) => description?.trim(),
  })
  description?: string;

  @Prop({
    required: false,
    default: null,
  })
  _image?: string;

  @Prop({
    required: true,
    default: true,
  })
  isActive: boolean;

  @Prop()
  createdBy: mongoose.Types.ObjectId;

  @Prop()
  updatedBy?: mongoose.Types.ObjectId;
}

export const AchievementSchema = SchemaFactory.createForClass(Achievement);

export const AchievementSchemaFactory = () => {
  const achievementSchema = AchievementSchema;

  achievementSchema.pre('findOneAndDelete', async function (next: NextFunction) {
    const achievement = await this.model.findOne(this.getFilter());
    // Thêm logic nếu cần, ví dụ: xoá các dữ liệu liên quan
    await Promise.all([]);
    return next();
  });

  return achievementSchema;
};
