import { BaseEntity } from '@modules/shared/base/base.entity';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Model } from 'mongoose';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { NextFunction } from 'express';

export type ArticleDocument = HydratedDocument<Article>;

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
export class Article extends BaseEntity {
  constructor(article: {
    categoryId?: string;
    title?: string;
    _image?: string;
    author?: string;
    content?: string;
    video?: string;
    status?: 'Published' | 'Draft';
    isActive?: boolean;
  }) {
    super();
    this.categoryId = article?.categoryId;
    this.title = article?.title;
    this._image = article?._image;
    this.author = article?.author;
    this.content = article?.content;
    this.video = article?.video;
    this.status = article?.status || 'Draft';
    this.isActive = article?.isActive ?? true;
  }

  @Prop({
    required: true,
    minlength: 3,
    maxlength: 50,
    set: (categoryId: string) => categoryId.trim(),
  })
  categoryId: string;

  @Prop({
    required: true,
    minlength: 5,
    maxlength: 100,
    set: (title: string) => title.trim(),
  })
  title: string;

  @Prop({
    default: 'https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png',
  })
  _image: string;

  @Prop({
    required: true,
    minlength: 3,
    maxlength: 50,
    set: (author: string) => author.trim(),
  })
  author: string;

  @Prop({
    required: true,
  })
  content: string;

  @Prop()
  video?: string;

  @Prop({
    required: true,
    enum: ['Published', 'Draft'],
    default: 'Draft',
  })
  status: 'Published' | 'Draft';

  @Prop({
    type: Boolean,
    default: true,
  })
  isActive: boolean;
}

export const ArticleSchema = SchemaFactory.createForClass(Article);

export const ArticleSchemaFactory = () => {
  const articleSchema = ArticleSchema;

  // Example pre-hook for cascading logic
  articleSchema.pre('findOneAndDelete', async function (next: NextFunction) {
    const article = await this.model.findOne(this.getFilter());

    // Add cascading deletion logic here if needed (e.g., deleting related data)

    return next();
  });

  return articleSchema;
};
