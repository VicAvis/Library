import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { ReadingProgressStatus } from '../enums/reading-status.enum';

@Entity('reading_progress')
@Index(['user_id', 'book_id'], { unique: true }) // user only one progress per book
export class ReadingProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index() 
  user_id: string;

  @Column({ type: 'uuid' })
  book_id: string;

  @Column({ type: 'int', default: 0 })
  current_page: number;

  @Column({ type: 'float', default: 0.0 }) //  0.0 to 100.0
  percentage_read: number;

  @Column({
    type: 'enum',
    enum: ReadingProgressStatus,
    default: ReadingProgressStatus.READING,
  })
  status: ReadingProgressStatus;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  started_at: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  last_read_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  finished_at?: Date;
}