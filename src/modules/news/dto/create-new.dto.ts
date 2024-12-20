import { IsNotEmpty, IsOptional } from "class-validator";
import mongoose from "mongoose";

export class CreateNewDto {
	@IsNotEmpty({message: 'Id không được để trống'})
	category_id?: mongoose.Schema.Types.ObjectId;
  
    @IsNotEmpty({message: 'Tiêu đề không được để trống'})
	title: string;

    @IsNotEmpty({message: 'Nội dung không được để trống'})
	content: string;
    
	@IsOptional()
	imageUrl: string;

    @IsNotEmpty({message: 'Id không được để trống'})
	author: string;

}
