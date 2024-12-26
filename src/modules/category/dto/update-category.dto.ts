import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';
import { IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @IsNotEmpty()

  category_name: string;
  
  @IsNotEmpty()
  topic_id: string;
  
  @IsOptional()
  description?: string;

  @IsOptional()
  image?:  string
}
