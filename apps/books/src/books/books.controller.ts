//apps/books/src/books/books.controller.ts
import { BooksService } from './books.service';
import { BookDto, CreateBookDto, UpdateBookDto, FindBooksFilterDto } from '@app/contracts';
import { BOOKS_PATTERNS } from '@app/contracts/books/books.patterns';
import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';


@Controller()
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @MessagePattern(BOOKS_PATTERNS.CREATE)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  async create(@Payload() createBookDto: CreateBookDto): Promise<BookDto> {
    console.log(`Received create book request: ${JSON.stringify(createBookDto)}`);
    try {
      return await this.booksService.create(createBookDto);
    } catch (error) {
      console.log(`Error in create book: ${error.message}`, error.stack);
      throw new RpcException(error);
    }
  }

  @MessagePattern(BOOKS_PATTERNS.FIND_ALL)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true, skipMissingProperties: true }))
  async findAll(@Payload() filterDto: FindBooksFilterDto): Promise<BookDto[]> {
    console.log(`Received find all books request with filters: ${JSON.stringify(filterDto)}`);
    try {
      return await this.booksService.findAll(filterDto);
    } catch (error) {
      console.log(`Error in findAll books: ${error.message}`, error.stack);
      throw new RpcException(error);
    }
  }

  @MessagePattern(BOOKS_PATTERNS.FIND_ONE)
  async findOne(@Payload('id') id: string): Promise<BookDto> { 
    console.log(`Received find one book request for id: ${id}`);
    try {
      return await this.booksService.findOne(id);
    } catch (error) {
      console.log(`Error in findOne book (id: ${id}): ${error.message}`, error.stack);
      throw new RpcException(error);
    }
  }

  @MessagePattern(BOOKS_PATTERNS.UPDATE)
  async update(@Payload() payload: { id: string; updateBookDto: UpdateBookDto }): Promise<BookDto> {
    console.log(`Received update book request for id: ${payload.id} with data: ${JSON.stringify(payload.updateBookDto)}`);
    try {
      return await this.booksService.update(payload.id, payload.updateBookDto);
    } catch (error) {
      console.log(`Error in update book (id: ${payload.id}): ${error.message}`, error.stack);
      throw new RpcException(error);
    }
  }

  @MessagePattern(BOOKS_PATTERNS.REMOVE)
  async remove(@Payload('id') id: string): Promise<{ deleted: boolean; message?: string }> { 
    console.log(`Received remove book request for id: ${id}`);
    try {
      return await this.booksService.remove(id);
    } catch (error) {
      console.log(`Error in remove book (id: ${id}): ${error.message}`, error.stack);
      throw new RpcException(error);
    }
  }
}