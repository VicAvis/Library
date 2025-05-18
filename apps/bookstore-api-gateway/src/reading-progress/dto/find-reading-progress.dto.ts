import { IsOptional, IsEnum, IsUUID } from 'class-validator';
import { ReadingProgressStatus } from './reading-status.enum'; 

export class FindReadingProgressQueryDto {
  @IsOptional()
  @IsEnum(ReadingProgressStatus)
  status?: ReadingProgressStatus;

  @IsOptional()
  @IsUUID()
  book_id?: string;
}