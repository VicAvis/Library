import { Test, TestingModule } from '@nestjs/testing';
import { ReadingProgressController } from './reading-progress/reading-progress.controller';
import { ReadingProgressService } from './reading-progress/reading-progress.service';

describe('ReadingProgressController', () => {
  let readingProgressController: ReadingProgressController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ReadingProgressController],
      providers: [ReadingProgressService],
    }).compile();

    readingProgressController = app.get<ReadingProgressController>(ReadingProgressController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(readingProgressController.getHello()).toBe('Hello World!');
    });
  });
});
