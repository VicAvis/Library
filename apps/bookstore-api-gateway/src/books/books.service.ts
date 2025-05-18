import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto'; 
import { FindBooksFilterDto } from './dto/find-books-filter.dto'; 
import { BookDto } from './dto/book.dto'; 
import { BOOKS_PATTERNS } from '@app/contracts/books/books.patterns'; 
import { BOOKS_CLIENT } from './constant';
import { catchError, lastValueFrom, throwError } from 'rxjs';

@Injectable()
export class BooksService {
  constructor(@Inject(BOOKS_CLIENT) private booksClient: ClientProxy) {}

  private handleRpcError(error: any) {
    if (error instanceof RpcException || (error.name === 'RpcException' && error.message)) {
        const rpcError = typeof error.getError === 'function' ? error.getError() : error;
        if (typeof rpcError === 'object' && rpcError !== null && 'status' in rpcError && 'message' in rpcError) {
            throw new HttpException(rpcError.message || 'An error occurred with the books service.', rpcError.status || HttpStatus.INTERNAL_SERVER_ERROR);
        } else {
             throw new HttpException(rpcError.toString() || 'An unexpected error occurred via RpcException with the books service.', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    throw new HttpException(error.message || 'An unexpected microservice error occurred with the books service.', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
  }

  async create(createBookDto: CreateBookDto): Promise<BookDto> {
    return lastValueFrom(
        this.booksClient.send<BookDto>(BOOKS_PATTERNS.CREATE, createBookDto)
        .pipe(catchError(err => throwError(() => this.handleRpcError(err))))
    );
  }

  async findAll(filterDto: FindBooksFilterDto): Promise<BookDto[]> {
    return lastValueFrom(
        this.booksClient.send<BookDto[]>(BOOKS_PATTERNS.FIND_ALL, filterDto) 
        .pipe(catchError(err => throwError(() => this.handleRpcError(err))))
    );
  }

  async findOne(id: string): Promise<BookDto> { 
    return lastValueFrom(
        this.booksClient.send<BookDto>(BOOKS_PATTERNS.FIND_ONE, { id }) 
        .pipe(catchError(err => throwError(() => this.handleRpcError(err))))
    );
  }

  async update(id: string, updateBookDto: UpdateBookDto): Promise<BookDto> {
    return lastValueFrom(
        this.booksClient.send<BookDto>(BOOKS_PATTERNS.UPDATE, { id, updateBookDto }) 
        .pipe(catchError(err => throwError(() => this.handleRpcError(err))))
    );
  }

  async remove(id: string): Promise<{ deleted: boolean; message?: string }> { 
    return lastValueFrom(
        this.booksClient.send<{ deleted: boolean; message?: string }>(BOOKS_PATTERNS.REMOVE, { id }) 
        .pipe(catchError(err => throwError(() => this.handleRpcError(err))))
    );
  }
}