import { BaseEntity } from "@modules/shared/base/base.entity";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { NextFunction } from "express";
import { required } from "joi";
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
export class Submission extends BaseEntity {
    constructor(submission: {
        user_id: mongoose.Types.ObjectId;
        quiz_id: mongoose.Types.ObjectId;
        question_id: mongoose.Types.ObjectId;
        result: boolean
    }) {
        super();
        this.user_id = submission.user_id;
        this.quiz_id = submission.quiz_id;
        this.question_id = submission.question_id;
        this.result = submission.result;
    }

    @Prop({
        required: true
    })
    user_id:  mongoose.Types.ObjectId;

    @Prop({
        required: true
    })
    quiz_id:  mongoose.Types.ObjectId;

    @Prop({
        required: true
    })
    question_id: mongoose.Types.ObjectId;

    @Prop({
        required: true
    })
    result: boolean
}

export const SubmissionSchema = SchemaFactory.createForClass(Submission);

export const SubmissionSchemaFactory = () => {
  const submissionSchema = SubmissionSchema;
  submissionSchema.pre('findOneAndDelete', async function (next: NextFunction) {
    const question = await this.model.findOne(this.getFilter());
    return next();
  });

  return submissionSchema;
};
