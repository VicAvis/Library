import { IsNotEmpty, IsString, IsUUID, IsInt, Min, Max, IsOptional, IsEnum } from 'class-validator';
import { ReadingProgressStatus } from '../enums/reading-status.enum';

export class CreateReadingProgressDto {
  // user_id will be passed by the service from the authenticated user context, not part of the DTO received from the API Gateway
  @IsNotEmpty()
  @IsUUID()
  book_id: string;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  current_page?: number = 0;

  @IsOptional()
  @IsEnum(ReadingProgressStatus)
  status?: ReadingProgressStatus = ReadingProgressStatus.READING;
}