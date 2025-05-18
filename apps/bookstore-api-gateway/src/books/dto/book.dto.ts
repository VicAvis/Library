// apps/bookstore-api-gateway/src/books/dto/book.dto.ts
export class BookDto {
  id: string;
  title: string;
  author: string;
  genre?: string;
  description?: string;
  publication_year?: number;
  file_url?: string;
  created_at: Date;
}
