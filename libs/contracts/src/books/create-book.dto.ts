//libs/contracts/src/books/create-book.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsInt, IsUrl, Min, MaxLength} from 'class-validator';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  author: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  genre?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1000)
  publication_year?: number;

  @IsOptional()
  @IsUrl()
  file_url?: string;
  
  @IsOptional()
  @IsInt()
  @Min(1) 
  total_pages?: number; 

}