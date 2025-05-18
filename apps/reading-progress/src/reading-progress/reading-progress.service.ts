import { Injectable, Logger, NotFoundException, InternalServerErrorException, ConflictException, ForbiddenException, Inject, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { ReadingProgress } from './entities/reading-progress.entity';
import { CreateReadingProgressDto } from './dto/create-reading-progress.dto';
import { UpdateReadingProgressDto } from './dto/update-reading-progress.dto';
import { ReadingProgressDto } from './dto/reading-progress.dto';
import { FindReadingProgressDto } from './dto/find-reading-progress.dto';
import { ReadingProgressStatus } from './enums/reading-status.enum';
import { ClientProxy } from '@nestjs/microservices';
import { BOOKS_SERVICE_CLIENT } from '../constants';
import { BookDto as ExternalBookDto } from '@app/contracts'; 
import { firstValueFrom, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BOOKS_PATTERNS } from '@app/contracts/books/books.patterns';
import { of } from 'rxjs';

@Injectable()
export class ReadingProgressService {
  constructor(
    @InjectRepository(ReadingProgress)
    private readingProgressRepository: Repository<ReadingProgress>,
    @Inject(BOOKS_SERVICE_CLIENT) private readonly booksClient: ClientProxy,
  ) {}

  private mapToDto(entity: ReadingProgress): ReadingProgressDto {
    return new ReadingProgressDto({ ...entity });
  }

  private async getBookTotalPages(bookId: string): Promise<number | null> {
    try {
      console.log(`Workspaceing total pages for book_id: ${bookId} from BooksService`);
      const bookDetails = await firstValueFrom(
        this.booksClient.send<ExternalBookDto>(BOOKS_PATTERNS.FIND_ONE, { id: bookId })
          .pipe(
            catchError(err => {
              console.log(`Error fetching book details for ${bookId} from BooksService: ${JSON.stringify(err)}`);
              if (err.status === 404 || (err.response && err.response.status === 404) || err.message?.includes('not found')) {
                 throw new NotFoundException(`Book with ID ${bookId} not found in Books Service.`);
              }
              return throwError(() => new InternalServerErrorException('Failed to fetch book details from Books Service.'));
            })
          )
      );

      if (bookDetails && typeof bookDetails.total_pages === 'number' && bookDetails.total_pages > 0) {
        console.log(`Book ${bookId} has ${bookDetails.total_pages} total pages.`);
        return bookDetails.total_pages;
      }
      console.log(`Book ${bookId} does not have a valid total_pages count.`);
      return null; 
    } catch (error) {
        if (error instanceof NotFoundException || error instanceof InternalServerErrorException) throw error;
        console.log(`Unexpected error in getBookTotalPages for ${bookId}: ${error.message}`, error.stack);
        throw new InternalServerErrorException('Failed to retrieve book page count due to an unexpected error.');
    }
  }

  private calculatePercentage(currentPage: number, totalPages: number | null): number {
    if (totalPages === null || totalPages <= 0 || currentPage < 0) {
      return 0.0;
    }
    if (currentPage >= totalPages) return 100.0;
    return parseFloat(((currentPage / totalPages) * 100).toFixed(2));
  }

  async createOrUpdateProgress(userId: string, createDto: CreateReadingProgressDto): Promise<ReadingProgressDto> {
    console.log(`Service: Create/Update progress for user ${userId}, book ${createDto.book_id}`);

    const totalPages = await this.getBookTotalPages(createDto.book_id); 

    let currentPage = createDto.current_page ?? 0;
    let currentStatus = createDto.status ?? ReadingProgressStatus.READING;
    let percentageRead: number;
    let finishedAt: Date | undefined = undefined;

    if (totalPages !== null && totalPages > 0) {
      if (currentPage > totalPages) {
        console.log(`User ${userId} reported current_page ${currentPage} for book ${createDto.book_id} which has ${totalPages} pages. Capping to ${totalPages}.`);
        currentPage = totalPages;
      }
    }
    const isExplicitlyCompleted = currentStatus === ReadingProgressStatus.COMPLETED;
    const isPageCompleted = (totalPages !== null && totalPages > 0 && currentPage >= totalPages);

    if (isExplicitlyCompleted || isPageCompleted) {
      currentStatus = ReadingProgressStatus.COMPLETED;
      percentageRead = 100.0;
      finishedAt = new Date();
      if (totalPages !== null && totalPages > 0) {
          currentPage = totalPages;
      }
    } else {
      percentageRead = this.calculatePercentage(currentPage, totalPages);
    }

    let progress = await this.readingProgressRepository.findOne({
      where: { user_id: userId, book_id: createDto.book_id },
    });

    if (progress) { 
      console.log(`Existing progress found (ID: ${progress.id}). Updating.`);
      progress.current_page = currentPage;
      progress.percentage_read = percentageRead;
      progress.status = currentStatus;
      progress.finished_at = finishedAt;
      // last_read_at is automatically updated by @UpdateDateColumn
    } else { 
      console.log('No existing progress. Creating new record.');
      progress = this.readingProgressRepository.create({
        book_id: createDto.book_id,
        user_id: userId,
        current_page: currentPage,
        percentage_read: percentageRead,
        status: currentStatus,
        started_at: new Date(),
        finished_at: finishedAt, 
      });
    }

    try {
      const savedProgress = await this.readingProgressRepository.save(progress);
      return this.mapToDto(savedProgress);
    } catch (error) {
      console.log(`Error saving progress for user ${userId}, book ${createDto.book_id}: ${error.message}`, error.stack);
      if (error.code === '23505') { 
        throw new ConflictException('Reading progress record conflict. This usually means a race condition if findOne didn\'t catch it.');
      }
      throw new InternalServerErrorException('Could not save reading progress.');
    }
  }

  async updateProgress(progressId: string, userId: string, updateDto: UpdateReadingProgressDto): Promise<ReadingProgressDto> {
    console.log(`Service: Update progress ID ${progressId} for user ${userId}`);
    const progress = await this.readingProgressRepository.findOne({ where: { id: progressId } });

    if (!progress) {
      throw new NotFoundException(`Reading progress with ID "${progressId}" not found.`);
    }
    if (progress.user_id !== userId) {
      throw new ForbiddenException('You can only update your own reading progress.');
    }

    const totalPages = await this.getBookTotalPages(progress.book_id); 

    let currentPage = progress.current_page;
    if (updateDto.current_page !== undefined) {
      currentPage = updateDto.current_page;
      if (totalPages !== null && totalPages > 0 && currentPage > totalPages) {
        console.log(`User ${userId} reported current_page ${currentPage} for book ${progress.book_id} (progress ID ${progressId}) which has ${totalPages} pages. Capping to ${totalPages}.`);
        currentPage = totalPages;
      }
    }

    let currentStatus = progress.status;
    if (updateDto.status !== undefined) {
      currentStatus = updateDto.status;
    }

    let percentageRead: number;
    let finishedAt: Date | undefined = progress.finished_at;

    const isExplicitlyCompleted = currentStatus === ReadingProgressStatus.COMPLETED;
    const isPageCompleted = (totalPages !== null && totalPages > 0 && currentPage >= totalPages);

    if (isExplicitlyCompleted || isPageCompleted) {
      currentStatus = ReadingProgressStatus.COMPLETED;
      percentageRead = 100.0;
      finishedAt = progress.finished_at ?? new Date(); 
      if (totalPages !== null && totalPages > 0) { 
          currentPage = totalPages;
      }
    } else {
      percentageRead = this.calculatePercentage(currentPage, totalPages);
      finishedAt = undefined; 
    }

    progress.current_page = currentPage;
    progress.percentage_read = percentageRead;
    progress.status = currentStatus;
    progress.finished_at = finishedAt;

    try {
      const updatedProgress = await this.readingProgressRepository.save(progress);
      return this.mapToDto(updatedProgress);
    } catch (error) {
      console.log(`Error updating progress ID ${progressId}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Could not update reading progress.');
    }
  }
  async findByUserId(userId: string, filterDto: FindReadingProgressDto): Promise<ReadingProgressDto[]> {
    console.log(`READING_MS Service: Fetching reading progress for user ${userId} with filters: ${JSON.stringify(filterDto)}`);
    const queryOptions: FindManyOptions<ReadingProgress> = {
      where: { user_id: userId }, order: { last_read_at: 'DESC' },
    };
    const whereConditions = queryOptions.where || {};
    
    if (filterDto.status) {
      whereConditions['status'] = filterDto.status;
    }
    
    if (filterDto.book_id) {
      whereConditions['book_id'] = filterDto.book_id;
    }
    console.log(`READING_MS Service: Query options: ${JSON.stringify(queryOptions.where)}`);
    queryOptions.where = whereConditions;

    const progresses = await this.readingProgressRepository.find(queryOptions);
    console.log(`READING_MS Service: Found ${progresses.length} progress records for user ${userId}.`);
    return progresses.map(p => this.mapToDto(p));
  }

  async getRecommendations(userId: string): Promise<any[]> {
    console.log(`Workspaceing recommendations for user ${userId}`);
    const completedProgress = await this.readingProgressRepository.find({
      where: { user_id: userId, status: ReadingProgressStatus.COMPLETED },
      select: ['book_id'],
    });

    if (completedProgress.length === 0) {
      console.log('No completed books found for recommendations.');
      return [];
    }

    const completedBookIds = completedProgress.map(p => p.book_id);
    console.log(`User ${userId} completed books: ${completedBookIds.join(', ')}`);

    try {
      const bookDetailsPromises = completedBookIds.map(bookId =>
          firstValueFrom(this.booksClient.send<ExternalBookDto>(BOOKS_PATTERNS.FIND_ONE, { id: bookId })
          .pipe(catchError(err => {
              console.log(`Error fetching details for recommended book ${bookId}: ${JSON.stringify(err)}`);
              return throwError(() => null);
          })))
      );
      const completedBooksDetails = (await Promise.all(bookDetailsPromises)).filter(book => book !== null) as ExternalBookDto[];


      if(completedBooksDetails.length === 0) {
        console.log('Could not fetch details for any completed books.');
        return [{ message: 'Could not fetch details for recommendation base.' }];
      }

      const genres = new Set<string>();
      const authors = new Set<string>();
      completedBooksDetails.forEach(book => {
          if (book.genre) genres.add(book.genre);
          if (book.author) authors.add(book.author);
      });

      console.log(`Preferred genres: ${Array.from(genres).join(', ')}, Preferred authors: ${Array.from(authors).join(', ')}`);

      const recommendationPromises: Promise<ExternalBookDto[]>[] = [];
      if (authors.size > 0) {
        recommendationPromises.push(
          ...Array.from(authors).map(author => firstValueFrom(this.booksClient.send<ExternalBookDto[]>(BOOKS_PATTERNS.FIND_ALL, { author }).pipe(
            catchError((err) => {
              console.log(`Error fetching by author ${author}: ${JSON.stringify(err)}`);
              return of([]); 
            })))
          )  
        );
      }
      if (genres.size > 0) {
        recommendationPromises.push(...Array.from(genres).map(genre =>
          firstValueFrom(
            this.booksClient.send<ExternalBookDto[]>(BOOKS_PATTERNS.FIND_ALL, { genre })
            .pipe(
            catchError((err) => {
              console.log(`Error fetching by genre ${genre}: ${JSON.stringify(err)}`);
              return of([]);
            })
          )
        )
      )
    );
  }
  const recommendationsNested = await Promise.all(recommendationPromises.map(p => p.catch(() => [])));
  const recommendations = recommendationsNested.flat();
      // already completed books and removing duplicates
      const uniqueRecommendations = new Map<string, ExternalBookDto>();
      recommendations.forEach(rec => {
        if (rec && rec.id && !completedBookIds.includes(rec.id)) {
            uniqueRecommendations.set(rec.id, rec);
        }
      });

      console.log(`Found ${uniqueRecommendations.size} potential recommendations.`);
      return Array.from(uniqueRecommendations.values()).slice(0, 5); // returning top 5 unique recommendations

    } catch (error) {
        console.log(`Error generating recommendations for user ${userId}: ${error.message}`, error.stack);
        return [{ message: 'Failed to generate recommendations at this time.' }];
    }
  }
}