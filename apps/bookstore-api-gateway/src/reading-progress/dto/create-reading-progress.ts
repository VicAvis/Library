import { IsNotEmpty, IsUUID, IsInt, Min, IsOptional, IsEnum } from 'class-validator';
import { ReadingProgressStatus } from './reading-status.enum';

export class CreateReadingProgressDto {
  @IsNotEmpty()
  @IsUUID()
  book_id: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  current_page?: number = 0;

  @IsOptional()
  @IsEnum(ReadingProgressStatus)
  status?: ReadingProgressStatus = ReadingProgressStatus.READING;
}