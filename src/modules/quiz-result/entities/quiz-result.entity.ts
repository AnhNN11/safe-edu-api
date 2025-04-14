import { BaseEntity } from "@modules/shared/base/base.entity";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { NextFunction } from "express";
import mongoose from "mongoose";

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
export class QuizResult extends BaseEntity {
    constructor(submission: {
        user_id: mongoose.Types.ObjectId;
        quiz_id: mongoose.Types.ObjectId;
        totalScore: number;
        completedAt: Date;
    }) {
        super();
        this.user_id = submission.user_id;
        this.quiz_id = submission.quiz_id;
        this.totalScore = submission.totalScore;
        this.completedAt = submission.completedAt;
    }
     @Prop({
        type: mongoose.Schema.Types.ObjectId,
        required: true
    })
    user_id:  mongoose.Types.ObjectId;

    @Prop({
        type: mongoose.Schema.Types.ObjectId, ref: 'Quiz',
        required: true
    })
    quiz_id: mongoose.Types.ObjectId;

    @Prop()
    totalScore: number;
  
    @Prop()
    completedAt: Date;
}

export const QuizResultSchema = SchemaFactory.createForClass(QuizResult);

export const QuizResultSchemaFactory = () => {
  const quizResultSchema = QuizResultSchema;
  quizResultSchema.pre('findOneAndDelete', async function (next: NextFunction) {
    const question = await this.model.findOne(this.getFilter());
    return next();
  });

  return quizResultSchema;
};