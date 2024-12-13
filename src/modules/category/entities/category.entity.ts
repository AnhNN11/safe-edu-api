import { BaseEntity } from '@modules/shared/base/base.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Model } from 'mongoose';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { NextFunction } from 'express';

export type CategoryDocument = HydratedDocument<Category>;

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
export class Category extends BaseEntity {
	constructor(Category: {
		category_name?: string;
        topic_id?:mongoose.Schema.Types.ObjectId;
		description?: string;
        image?: string;
		
	}) {
		super();
		this.category_name = Category?.category_name;
        this.topic_id = Category?.topic_id;
        this.description = Category?.description;
        this.image = Category?.image;
	}
	
	@Prop({
		required: true,
		minlength: 2,
		maxlength: 60,
		set: (category_name: string) => {
			return category_name.trim();
		},
	})
	category_name: string;

	@Prop({
		required: true,
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Topic',
	  })
	  topic_id: mongoose.Schema.Types.ObjectId;

    @Prop()
	description: string;
	@Prop({
		default:
			'https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png',
	})
	image?: string;



}

export const CategorySchema = SchemaFactory.createForClass(Category);

export const CategorySchemaFactory = () => {
  const category_schema = CategorySchema;

  category_schema.pre('findOneAndDelete', async function (next: NextFunction) {
    const category = await this.model.findOne(this.getFilter());
    


    await Promise.all([]); 

    return next();
  });

  return category_schema;
};

