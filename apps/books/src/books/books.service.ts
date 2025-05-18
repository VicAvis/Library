import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, ILike } from 'typeorm';
import { Book } from './entities/book.entity';
import { BookDto, CreateBookDto, UpdateBookDto, FindBooksFilterDto } from '@app/contracts';

@Injectable()
export class BooksService {
  private readonly logger = new Logger(BooksService.name);

  constructor(
    @InjectRepository(Book)
    private booksRepository: Repository<Book>,
  ) {}

  private mapToBookDto(book: Book): BookDto {
    return new BookDto({
      id: book.id,
      title: book.title,
      author: book.author,
      genre: book.genre,
      description: book.description,
      publication_year: book.publication_year,
      file_url: book.file_url,
      created_at: book.created_at,
    });
  }

  async create(createBookDto: CreateBookDto): Promise<BookDto> {
    try {
      const book = this.booksRepository.create(createBookDto);
      const savedBook = await this.booksRepository.save(book);
      return this.mapToBookDto(savedBook);
    } catch (error) {
      this.logger.error(`Failed to create book: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Could not create book.');
    }
  }

  async findAll(filterDto: FindBooksFilterDto): Promise<BookDto[]> {
    const { genre, author, publication_year } = filterDto;
    const queryOptions: FindManyOptions<Book> = { where: {} };
  if (genre) {
    queryOptions.where!['genre'] = ILike(`%${genre}%`); 
  }
  if (author) {
    queryOptions.where!['author'] = ILike(`%${author}%`);
  }
  if (publication_year) {
    queryOptions.where!['publication_year'] = publication_year;
  }

    const books = await this.booksRepository.find(queryOptions);
    return books.map(book => this.mapToBookDto(book));
  }

  async findOne(id: string): Promise<BookDto> {
    if (!this.isValidUuid(id)) {
        throw new BadRequestException('Invalid UUID format for book ID.');
    }
    const book = await this.booksRepository.findOne({ where: { id } });
    if (!book) {
      throw new NotFoundException(`Book with ID "${id}" not found.`);
    }
    return this.mapToBookDto(book);
  }

  async update(id: string, updateBookDto: UpdateBookDto): Promise<BookDto> {
     if (!this.isValidUuid(id)) {
        throw new BadRequestException('Invalid UUID format for book ID.');
    }
    const bookToUpdate = await this.booksRepository.preload({
        id: id,
        ...updateBookDto,
    });

    if (!bookToUpdate) {
        throw new NotFoundException(`Book with ID "${id}" not found.`);
    }
    
    try {
        const updatedBook = await this.booksRepository.save(bookToUpdate);
        return this.mapToBookDto(updatedBook);
    } catch (error) {
        this.logger.error(`Failed to update book ${id}: ${error.message}`, error.stack);
        throw new InternalServerErrorException('Could not update book.');
    }
  }

  async remove(id: string): Promise<{ deleted: boolean; message?: string }> {
    if (!this.isValidUuid(id)) {
        throw new BadRequestException('Invalid UUID format for book ID.');
    }
    const result = await this.booksRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Book with ID "${id}" not found.`);
    }
    return { deleted: true };
  }

  private isValidUuid(uuid: string): boolean {
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    return uuidRegex.test(uuid);
  }
}