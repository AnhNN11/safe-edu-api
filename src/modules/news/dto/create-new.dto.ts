import { IsNotEmpty, IsOptional } from "class-validator";
import mongoose from "mongoose";

export class CreateNewDto {
	@IsNotEmpty()
	topic_id: string;
  
    @IsNotEmpty()
	title: string;

    @IsNotEmpty()
	content: string;
    
	@IsOptional()
	image: string;

    @IsNotEmpty()
	author: string;

}
