import { BaseEntity } from '@modules/shared/base/base.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Model } from 'mongoose';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { NextFunction } from 'express';

// INNER

// OUTER

export type TestDocument = HydratedDocument<Test>;

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
export class Test extends BaseEntity {
	constructor(user: { email?: string }) {
		super();

		this.email = user?.email;
	}

	@Prop({
		required: true,
		unique: true,
		match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
	})
	// @Expose({ name: 'mail', toPlainOnly: true })
	email: string;
}

export const TestSchema = SchemaFactory.createForClass(Test);

export const TestSchemaFactory = () => {
	const user_schema = TestSchema;

	user_schema.pre('findOneAndDelete', async function (next: NextFunction) {
		// OTHER USEFUL METHOD: getOptions, getPopulatedPaths, getQuery = getFilter, getUpdate
		const user = await this.model.findOne(this.getFilter());
		await Promise.all([]);
		return next();
	});
	return user_schema;
};
