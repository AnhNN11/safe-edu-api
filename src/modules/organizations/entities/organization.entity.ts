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
        email?: string;
        name?: string;
        username?: string;
        phone_number?: string;
        password?: string;
        address?: string;
    }) {
        super();
        this.email = organization?.email;
        this.name = organization?.name;
        this.username = organization?.username;
        this.phone_number = organization?.phone_number;
        this.password = organization.password;
        this.address = organization.address;
    }

    @Prop({
		required: true,
		unique: true,
		match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
	})
	email: string;

    @Prop()
    name: string;

    @Prop({
		required: true,
		unique: true,
	})
	username: string;

    @Prop({
		match: /^([+]\d{2})?\d{10}$/,
		get: (phone_number: string) => {
			if (!phone_number) {
				return;
			}
			const last_four_digits = phone_number.slice(phone_number.length - 4);
			return `***-***-${last_four_digits}`;
		},
	})
	phone_number?: string;

    @Exclude()
	@Prop()
	password?: string;

    @Prop()
    address?: string;
}
