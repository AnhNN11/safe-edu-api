import { BaseEntity } from '@modules/shared/base/base.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Model, Types } from 'mongoose';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { NextFunction } from 'express';

// INNER

// OUTER
import { UserRole } from '@modules/user-roles/entities/user-role.entity';
import { Organization } from '@modules/organizations/entities/organization.entity';

export type UserDocument = HydratedDocument<User>;

export enum GENDER {
	MALE = 'Male',
	FEMALE = 'Female',
	OTHER = 'Other',
}

export enum USER_ROLE {
	ADMIN = 'Admin',
	STUDENT = 'Student',
	USER = 'User',
	MANAGER = 'Manager',
	SUPERVISOR = 'Supervisor'
}
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
export class User extends BaseEntity {
	constructor(user: {
		first_name?: string;
		last_name?: string;
		email?: string;
		username?: string;
		password?: string;
		role?: string;
		gender?: GENDER;
		phone_number?: string;
	}) {
		super();
		this.first_name = user?.first_name;
		this.last_name = user?.last_name;
		this.email = user?.email;
		this.username = user?.username;
		this.password = user?.password;
		this.role = user?.role;
		this.gender = user?.gender;
		this.phone_number = user?.phone_number;
	}
	
	@Prop({
		required: true,
		minlength: 2,
		maxlength: 60,
		set: (first_name: string) => {
			return first_name.trim();
		},
	})
	first_name: string;

	@Prop({
		required: true,
		minlength: 2,
		maxlength: 60,
		set: (last_name: string) => {
			return last_name.trim();
		},
	})
	last_name: string;

	@Prop({
		required: false,
		unique: true,
		match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
	})
	// @Expose({ name: 'mail', toPlainOnly: true })
	email: string;

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

	@Prop({
		required: false,
		unique: true,
	})
	username: string;

	@Exclude()
	@Prop()
	password?: string;

	@Prop({ default: false })
	is_registered_with_google?: boolean;

	@Prop({ type: Types.ObjectId, 
			ref: 'Organization', 
			required: false})
	organizationId: string

	@Prop({
		default:
			'https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png',
	})
	avatar?: string;

	@Prop()
	date_of_birth?: Date;

	@Prop({
		enum: GENDER,
	})
	gender: GENDER;

	@Prop({ default: 0 })
	point?: number;

	@Prop({
		type: mongoose.Schema.Types.ObjectId,
		ref: UserRole.name,
		required: true,
	})
	@Type(() => UserRole)
	@Transform((value) => value.obj.role?.name, { toClassOnly: true })
	role: string;

	@Prop()
	@Exclude()
	current_refresh_token?: string;

	@Expose({ name: 'full_name' })
	get fullName(): string {
		return `${this.first_name} ${this.last_name}`;
	}
}

export const UserSchema = SchemaFactory.createForClass(User);

export const UserSchemaFactory = () => {
	const user_schema = UserSchema;

	user_schema.pre('findOneAndDelete', async function (next: NextFunction) {
		// OTHER USEFUL METHOD: getOptions, getPopulatedPaths, getQuery = getFilter, getUpdate
		const user = await this.model.findOne(this.getFilter());
		await Promise.all([]);
		return next();
	});
	return user_schema;
};
