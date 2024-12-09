import { BaseEntity } from "@modules/shared/base/base.entity";
import { Prop, Schema } from "@nestjs/mongoose";
import { Exclude } from "class-transformer";
import { HydratedDocument, StringExpressionOperatorReturningBoolean } from "mongoose";

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
        name?: string;
        address?: string;
    }) {
        super();
        this.name = organization?.name;
        this.address = organization.address;
    }

    @Prop()
    name: string;

    @Prop()
    address?: string;
}
