
// apps/bookstore-api-gateway/src/reading-progress/reading-progress/reading-progress.controller.ts
import { Controller, HttpException, Post, Get, Put, Param, Body, Query, UseGuards, Req, ParseUUIDPipe, HttpCode, HttpStatus, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReadingProgressService } from './reading-progress.service';
import { CreateReadingProgressDto } from './dto/create-reading-progress';
import { UpdateReadingProgressDto } from './dto/update-reading-progress.dto';
import { FindReadingProgressQueryDto } from './dto/find-reading-progress.dto';
import { ReadingProgressDto } from './dto/reading-progress.dto';
import { Roles, Role } from '../../../../libs/common/decorators/roles.decorator'; 
import { RolesGuard } from '../../../../libs/common/guards/roles.guard'; 

@Controller('reading-progress')
@UseGuards(AuthGuard('jwt')) // routes here require authentication
export class ReadingProgressController {
  constructor(private readonly readingProgressService: ReadingProgressService) {}

  @Post()
  @HttpCode(HttpStatus.OK) 
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  createOrUpdateProgress(
    @Req() req: any, // get userId from JWT payload
    @Body() createReadingProgressDto: CreateReadingProgressDto,
  ): Promise<ReadingProgressDto> {
    const userId = req.user.userId;
    return this.readingProgressService.createOrUpdateProgress(userId, createReadingProgressDto);
  }

  @Get()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true, skipMissingProperties: true }))
  findUserProgress(
    @Req() req: any, 
    @Query() filterDto: FindReadingProgressQueryDto,
  ): Promise<ReadingProgressDto[]> {
    console.log(`API_GATEWAY Controller: req.user object: ${JSON.stringify(req.user)}`);
    if (!req.user || !req.user.userId) {
        console.log('API_GATEWAY Controller: userId not found on req.user!');
        throw new HttpException('User not authenticated properly.', HttpStatus.UNAUTHORIZED);
    }
    const userId = req.user.userId;
    console.log(`API_GATEWAY Controller: Calling findUserProgress for userId: ${userId} with filters: ${JSON.stringify(filterDto)}`);
    return this.readingProgressService.findUserProgress(userId, filterDto);
  }

  @Get('user/:targetUserId')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin) // only admin can see other user progress
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true, skipMissingProperties: true }))
  findSpecificUserProgress(
    @Param('targetUserId', ParseUUIDPipe) targetUserId: string,
    @Query() filterDto: FindReadingProgressQueryDto,
  ): Promise<ReadingProgressDto[]> {
    return this.readingProgressService.findUserProgress(targetUserId, filterDto);
  }


  @Put(':id') // :id is the reading_progress record's ID
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  updateProgress(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: any,
    @Body() updateReadingProgressDto: UpdateReadingProgressDto,
  ): Promise<ReadingProgressDto> {
    const userId = req.user.userId;
    return this.readingProgressService.updateProgress(id, userId, updateReadingProgressDto);
  }

  @Get('recommendations')
  getRecommendations(@Req() req: any): Promise<any[]> {
    const userId = req.user.userId;
    return this.readingProgressService.getRecommendations(userId);
  }
}