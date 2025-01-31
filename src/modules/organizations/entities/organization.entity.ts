import { BaseEntity } from "@modules/shared/base/base.entity";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Exclude } from "class-transformer";
import { NextFunction } from 'express';
import mongoose, { HydratedDocument, StringExpressionOperatorReturningBoolean } from "mongoose";

export type OrganizationDocument = HydratedDocument<Organization>;

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

export class Organization extends BaseEntity {
    constructor(organization: {
        name: string;
        province_id: mongoose.Types.ObjectId;
    }) {
        super();
        this.name = organization?.name;
        this.province_id = organization.province_id;
    }

    @Prop()
    name: string;

    @Prop({
		type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Province' }],
		default: [],
	})
    province_id: mongoose.Types.ObjectId;
}

export const OrganizationsSchema = SchemaFactory.createForClass(Organization);

export const OrganizationSchemaFactory = () => {
	const organization_schema = OrganizationsSchema;

	organization_schema.pre('findOneAndDelete', async function (next: NextFunction) {
		// OTHER USEFUL METHOD: getOptions, getPopulatedPaths, getQuery = getFilter, getUpdate
		const organization = await this.model.findOne(this.getFilter());
		await Promise.all([]);
		return next();
	});
	return organization_schema;
};
