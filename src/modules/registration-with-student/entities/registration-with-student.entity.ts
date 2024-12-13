import { BaseEntity } from '@modules/shared/base/base.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { NextFunction } from 'express';

export type RegistrationWithStudentDocument = HydratedDocument<RegistrationWithStudent>;

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
export class RegistrationWithStudent extends BaseEntity {
  constructor(registration: {
    competitionId?: number;
    createdDate?: Date;
  }) {
    super();
    this.competitionId = registration?.competitionId;
    this.createdDate = registration?.createdDate;
  }

  @Prop({
    required: true,
    type: Number,
  })
  competitionId: number;

  @Prop({
    required: true,
    type: Date,
  })
  createdDate: Date; // Registration date
}

export const RegistrationWithStudentSchema = SchemaFactory.createForClass(RegistrationWithStudent);

export const RegistrationWithStudentSchemaFactory = () => {
  const registrationSchema = RegistrationWithStudentSchema;

  // Add pre-hook logic if needed
  registrationSchema.pre('findOneAndDelete', async function (next: NextFunction) {
    const registration = await this.model.findOne(this.getFilter());

    // Add cascading deletion logic if necessary
    return next();
  });

  return registrationSchema;
};
