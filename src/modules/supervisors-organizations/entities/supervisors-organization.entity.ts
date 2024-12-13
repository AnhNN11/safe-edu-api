import { BaseEntity } from '@modules/shared/base/base.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { NextFunction } from 'express';

export type SupervisorOrganizationDocument = HydratedDocument<SupervisorOrganization>;

@Schema({
  timestamps: {
    createdAt: 'created_at', // Mapping to 'createdAt'
    updatedAt: false, // No updatedAt field
  },
  toJSON: {
    getters: true,
    virtuals: true,
  },
})
export class SupervisorOrganization extends BaseEntity {
  constructor(supervisorOrganization: {
    supervisorId?: number;
    organizationId?: number;
  }) {
    super();
    this.supervisorId = supervisorOrganization?.supervisorId;
    this.organizationId = supervisorOrganization?.organizationId;
  }

  @Prop({
    required: true,
    type: Number,
  })
  supervisorId: number;

  @Prop({
    required: true,
    type: Number,
  })
  organizationId: number;
}

export const SupervisorOrganizationSchema = SchemaFactory.createForClass(SupervisorOrganization);

export const SupervisorOrganizationSchemaFactory = () => {
  const supervisorOrganizationSchema = SupervisorOrganizationSchema;

  // Add pre-hook logic if needed
  supervisorOrganizationSchema.pre('findOneAndDelete', async function (next: NextFunction) {
    const supervisorOrganization = await this.model.findOne(this.getFilter());

    // Add cascading deletion logic if necessary
    return next();
  });

  return supervisorOrganizationSchema;
};
