import { BaseEntity } from '@modules/shared/base/base.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { NextFunction } from 'express';

export type UserAchievementDocument = HydratedDocument<UserAchievement>;

@Schema({
  timestamps: {
    createdAt: 'created_date', // Mapping to 'createdDate'
    updatedAt: false, // No updatedAt field
  },
  toJSON: {
    getters: true,
    virtuals: true,
  },
})
export class UserAchievement extends BaseEntity {
  constructor(userAchievement: {
    userId?: number;
    achievementId?: number;
    createdDate?: Date;
  }) {
    super();
    this.userId = userAchievement?.userId;
    this.achievementId = userAchievement?.achievementId;
    this.createdDate = userAchievement?.createdDate;
  }

  @Prop({
    required: true,
    type: Number,
  })
  userId: number;

  @Prop({
    required: true,
    type: Number,
  })
  achievementId: number;

  @Prop({
    required: true,
    type: Date,
  })
  createdDate: Date; // Awarded date
}

export const UserAchievementSchema = SchemaFactory.createForClass(UserAchievement);

export const UserAchievementSchemaFactory = () => {
  const userAchievementSchema = UserAchievementSchema;

  // Add pre-hook logic if needed
  userAchievementSchema.pre('findOneAndDelete', async function (next: NextFunction) {
    const userAchievement = await this.model.findOne(this.getFilter());

    // Add cascading deletion logic if necessary
    return next();
  });

  return userAchievementSchema;
};
