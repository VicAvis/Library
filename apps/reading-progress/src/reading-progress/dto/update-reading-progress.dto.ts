import { IsInt, Min, Max, IsOptional, IsEnum } from 'class-validator';
import { ReadingProgressStatus } from '../enums/reading-status.enum';

export class UpdateReadingProgressDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  current_page?: number;

  @IsOptional()
  @IsEnum(ReadingProgressStatus)
  status?: ReadingProgressStatus;
}