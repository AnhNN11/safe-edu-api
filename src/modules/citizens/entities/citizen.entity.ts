import { BaseEntity } from '@modules/shared/base/base.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { NextFunction } from 'express';

export type CitizenDocument = HydratedDocument<Citizen>;

@Schema({
  timestamps: {
    createdAt: 'created_at', // Mapping to 'createdAt'
    updatedAt: 'updated_at', // Mapping to 'updatedAt'
  },
  toJSON: {
    getters: true,
    virtuals: true,
  },
})
export class Citizen extends BaseEntity {
  constructor(citizen: {
    password?: string;
    first_name?: string;
    last_name?: string;
    avatar?: string;
    phone?: string;
    gender?: 'Male' | 'Female' | 'Other';
  }) {
    super();
    this.password = citizen?.password;
    this.first_name = citizen?.first_name;
    this.last_name = citizen?.last_name;
    this.avatar = citizen?.avatar;
    this.phone = citizen?.phone;
    this.gender = citizen?.gender;
  }

  @Prop({
    required: true,
    minlength: 6,
    maxlength: 100,
    set: (password: string) => password.trim(),
  })
  password: string;

  @Prop({
    required: true,
    minlength: 2,
    maxlength: 50,
    set: (first_name: string) => first_name.trim(),
  })
  first_name: string;

  @Prop({
    required: true,
    minlength: 2,
    maxlength: 50,
    set: (last_name: string) => last_name.trim(),
  })
  last_name: string;

  @Prop({
    default: 'https://example.com/default-avatar.png',
  })
  avatar: string;

  @Prop({
    required: true,
    match: /^[0-9]{10}$/, // Match for 10-digit phone number format
  })
  phone: string;

  @Prop({
    enum: ['Male', 'Female', 'Other'],
    required: true,
  })
  gender: 'Male' | 'Female' | 'Other';
}

export const CitizenSchema = SchemaFactory.createForClass(Citizen);

export const CitizenSchemaFactory = () => {
  const citizenSchema = CitizenSchema;

  // Add pre-hook logic if needed
  citizenSchema.pre('findOneAndDelete', async function (next: NextFunction) {
    const citizen = await this.model.findOne(this.getFilter());

    // Add cascading deletion logic if necessary
    return next();
  });

  return citizenSchema;
};
