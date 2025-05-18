// apps/bookstore-api-gateway/src/books/books.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, ParseUUIDPipe, UsePipes, ValidationPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto'; 
import { UpdateBookDto } from './dto/update-book.dto'; 
import { FindBooksFilterDto } from './dto/find-books-filter.dto'; 
import { BookDto } from './dto/book.dto'; 
import { Roles, Role } from '../../../../libs/common/decorators/roles.decorator'; 
import { RolesGuard } from '../../../../libs/common/guards/roles.guard'; 

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard) 
  @Roles(Role.Admin)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createBookDto: CreateBookDto): Promise<BookDto> {
    return this.booksService.create(createBookDto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard) 
  @Roles(Role.Admin, Role.User) 
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true, skipMissingProperties: true }))
  findAll(@Query() filterDto: FindBooksFilterDto): Promise<BookDto[]> { 
    return this.booksService.findAll(filterDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt')) 
  @Roles(Role.Admin, Role.User) 
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<BookDto> {
    return this.booksService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin) 
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBookDto: UpdateBookDto
  ): Promise<BookDto> {
    return this.booksService.update(id, updateBookDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin) 
  @HttpCode(HttpStatus.OK) 
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> { 
    await this.booksService.remove(id);
  }
}