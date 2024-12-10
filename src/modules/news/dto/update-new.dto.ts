import { IsNotEmpty, IsOptional } from "class-validator";

export class UpdateNewDto {
    @IsNotEmpty()
	topic_id: string;
  
    @IsNotEmpty()
	title: string;

    @IsNotEmpty()
	content: string;
    
    @IsOptional()
	imageUrl: string;

    @IsNotEmpty()
	author: string;
}
