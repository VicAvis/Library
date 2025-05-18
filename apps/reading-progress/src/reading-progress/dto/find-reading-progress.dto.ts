import { IsOptional, IsEnum, IsUUID } from 'class-validator';
import { ReadingProgressStatus } from '../enums/reading-status.enum';

export class FindReadingProgressDto {
  @IsOptional()
  @IsEnum(ReadingProgressStatus)
  status?: ReadingProgressStatus;

  @IsOptional()
  @IsUUID()
  book_id?: string; 
}