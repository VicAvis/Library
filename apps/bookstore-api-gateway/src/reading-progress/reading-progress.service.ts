import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { READING_PROGRESS_CLIENT } from './reading-progress/constant';
import { CreateReadingProgressDto } from './dto/create-reading-progress';
import { UpdateReadingProgressDto } from './dto/update-reading-progress.dto';
import { ReadingProgressDto } from './dto/reading-progress.dto';
import { FindReadingProgressQueryDto } from './dto/find-reading-progress.dto';
import { READING_PROGRESS_PATTERNS } from './reading-progress/patterns'; 
import { catchError, lastValueFrom, tap, throwError } from 'rxjs';

@Injectable()
export class ReadingProgressService {
  constructor(
    @Inject(READING_PROGRESS_CLIENT) private client: ClientProxy,
  ) {}

private handleRpcError(error: any, context: string = 'operation') {
    console.log(`RPC Error during ${context}: ${JSON.stringify(error)}`, error.stack);
    if (error instanceof RpcException || (typeof error === 'object' && error !== null && error.message && error.name === 'RpcException')) {
        const rpcErrorObject = typeof error.getError === 'function' ? error.getError() : error; 
        const message = (typeof rpcErrorObject === 'object' && rpcErrorObject !== null) ? rpcErrorObject.message : rpcErrorObject;
        const status = (typeof rpcErrorObject === 'object' && rpcErrorObject !== null) ? rpcErrorObject.status : HttpStatus.INTERNAL_SERVER_ERROR;
        throw new HttpException(message || `An error occurred with the ${context}.`, status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
    const status = error.status || error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
    const message = error.message || `An unexpected microservice error occurred during ${context}.`;
    throw new HttpException(message, status);
  }

  async findUserProgress(userId: string, filterDto: FindReadingProgressQueryDto): Promise<ReadingProgressDto[]> {
    const payload = { userId, filterDto };
    console.log(`API_GATEWAY: Sending ${READING_PROGRESS_PATTERNS.FIND_BY_USER_ID} to READING_PROGRESS_CLIENT with payload: ${JSON.stringify(payload)}`);
    return lastValueFrom(
      this.client.send(READING_PROGRESS_PATTERNS.FIND_BY_USER_ID, payload)
        .pipe(
          tap(response => console.log(`API_GATEWAY: Response from READING_PROGRESS_CLIENT for ${READING_PROGRESS_PATTERNS.FIND_BY_USER_ID}: ${JSON.stringify(response)}`)),
          catchError(err => {
            return throwError(() => this.handleRpcError(err, 'finding user progress'));
          })
        )
    );
  }

  async createOrUpdateProgress(userId: string, dto: CreateReadingProgressDto): Promise<ReadingProgressDto> {
    return lastValueFrom(
      this.client.send(READING_PROGRESS_PATTERNS.CREATE_OR_UPDATE, { userId, createReadingProgressDto: dto })
        .pipe(catchError(err => throwError(() => this.handleRpcError(err)))),
    );
  }

  async updateProgress(progressId: string, userId: string, dto: UpdateReadingProgressDto): Promise<ReadingProgressDto> {
    return lastValueFrom(
      this.client.send(READING_PROGRESS_PATTERNS.UPDATE_BY_ID, { progressId, userId, updateReadingProgressDto: dto })
        .pipe(catchError(err => throwError(() => this.handleRpcError(err)))),
    );
  }

  async getRecommendations(userId: string): Promise<any[]> {
     return lastValueFrom(
      this.client.send(READING_PROGRESS_PATTERNS.GET_RECOMMENDATIONS, { userId })
        .pipe(catchError(err => throwError(() => this.handleRpcError(err)))),
    );
  }
}