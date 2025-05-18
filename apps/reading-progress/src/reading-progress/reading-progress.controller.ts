import { Controller, Logger, UsePipes, ValidationPipe } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { ReadingProgressService } from './reading-progress.service';
import { CreateReadingProgressDto } from './dto/create-reading-progress.dto';
import { UpdateReadingProgressDto } from './dto/update-reading-progress.dto';
import { FindReadingProgressDto } from './dto/find-reading-progress.dto';
import { ReadingProgressDto } from './dto/reading-progress.dto';

export const READING_PROGRESS_PATTERNS = {
  CREATE_OR_UPDATE: 'readingProgress.createOrUpdate',
  FIND_BY_USER_ID: 'readingProgress.findByUserId',
  UPDATE_BY_ID: 'readingProgress.updateById',
  GET_RECOMMENDATIONS: 'readingProgress.getRecommendations',
};

@Controller()
export class ReadingProgressController {

  constructor(private readonly readingProgressService: ReadingProgressService) {}


  @MessagePattern(READING_PROGRESS_PATTERNS.CREATE_OR_UPDATE)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  async createOrUpdateProgress(
    @Payload() payload: { userId: string; createReadingProgressDto: CreateReadingProgressDto },
  ): Promise<ReadingProgressDto> {
    console.log(`Ctrl: Create/Update progress for user ${payload.userId}, book ${payload.createReadingProgressDto.book_id}`);
    try {
      return await this.readingProgressService.createOrUpdateProgress(
        payload.userId,
        payload.createReadingProgressDto,
      );
    } catch (error) {
      console.log(`Ctrl Error: Create/Update progress: ${error.message}`, error.stack);
      throw new RpcException(error);
    }
  }

  @MessagePattern(READING_PROGRESS_PATTERNS.UPDATE_BY_ID)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  async updateProgressById(
    @Payload() payload: { progressId: string; userId: string; updateReadingProgressDto: UpdateReadingProgressDto },
  ): Promise<ReadingProgressDto> {
    console.log(`Ctrl: Update progress ID ${payload.progressId} for user ${payload.userId}`);
    try {
      return await this.readingProgressService.updateProgress(
        payload.progressId,
        payload.userId,
        payload.updateReadingProgressDto,
      );
    } catch (error) {
      console.log(`Ctrl Error: Update progress ID ${payload.progressId}: ${error.message}`, error.stack);
      throw new RpcException(error);
    }
  }

@MessagePattern(READING_PROGRESS_PATTERNS.FIND_BY_USER_ID)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true, skipMissingProperties: true }))
async findByUserId(
  @Payload() payload: { userId: string; filterDto: FindReadingProgressDto },
): Promise<ReadingProgressDto[]> {
  console.log(`READING_MS Ctrl: Find progress for user ${payload.userId} with filters ${JSON.stringify(payload.filterDto)}`);
  try {
    if (!payload || typeof payload.userId !== 'string' || typeof payload.filterDto === 'undefined') {
        console.log(`READING_MS Ctrl: Invalid payload structure for FIND_BY_USER_ID: ${JSON.stringify(payload)}`);
        throw new RpcException({status: 400, message: 'Invalid payload structure for finding user progress.'});
    }
    return await this.readingProgressService.findByUserId(payload.userId, payload.filterDto);
  } catch (error) {
    console.log(`READING_MS Ctrl Error: Find progress for user ${payload.userId}: ${error.message}`, error.stack);
    if (error instanceof RpcException) throw error;
    throw new RpcException({ status: error.status || 500, message: error.message || 'Failed to find user progress.'});
  }
}

  @MessagePattern(READING_PROGRESS_PATTERNS.GET_RECOMMENDATIONS)
  async getRecommendations(@Payload('userId') userId: string): Promise<any[]> {
    console.log(`Ctrl: Get recommendations for user ${userId}`);
    try {
      return await this.readingProgressService.getRecommendations(userId);
    } catch (error) {
        console.log(`Ctrl Error: Get recommendations for user ${userId}: ${error.message}`, error.stack);
        throw new RpcException(error);
    }
  }
}