import { IsInt, Min, IsOptional, IsEnum } from 'class-validator';
import { ReadingProgressStatus } from './reading-status.enum';

export class UpdateReadingProgressDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  current_page?: number;

  @IsOptional()
  @IsEnum(ReadingProgressStatus)
  status?: ReadingProgressStatus;
}