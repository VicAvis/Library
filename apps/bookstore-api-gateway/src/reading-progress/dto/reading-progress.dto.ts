import { ReadingProgressStatus } from './reading-status.enum';

export class ReadingProgressDto {
  id: string;
  user_id: string;
  book_id: string;
  current_page: number;
  percentage_read: number;
  status: ReadingProgressStatus;
  started_at: Date;
  last_read_at: Date;
  finished_at?: Date;

  constructor(partial: Partial<ReadingProgressDto>) {
    Object.assign(this, partial);
  }
}