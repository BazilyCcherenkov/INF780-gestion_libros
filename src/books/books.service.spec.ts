import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { BooksService } from './books.service';
import { Book } from './entities/book.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { SortOrder, ReadStatus } from './dto/query-book.dto';

const mockBook: Book = {
  id: 1,
  title: 'Cien años de soledad',
  author: 'Gabriel García Márquez',
  year: 1967,
  genre: 'Realismo mágico',
  pages: 417,
  read: true,
  rating: 5,
  notes: 'Obra maestra',
  readDate: new Date('2024-01-15'),
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('BooksService', () => {
  let service: BooksService;
  let repository: Repository<Book>;

  const createMockQueryBuilder = () => ({
    andWhere: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getCount: jest.fn().mockResolvedValue(1),
    getMany: jest.fn().mockResolvedValue([mockBook]),
    getRawOne: jest.fn().mockResolvedValue({ average: '4.5', total: '500' }),
  });

  const mockRepository: any = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(() => createMockQueryBuilder()),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        {
          provide: getRepositoryToken(Book),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
    repository = module.get<Repository<Book>>(getRepositoryToken(Book));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new book successfully', async () => {
      const createBookDto: CreateBookDto = {
        title: 'Cien años de soledad',
        author: 'Gabriel García Márquez',
        year: 1967,
      };

      mockRepository.create.mockReturnValue(mockBook);
      mockRepository.save.mockResolvedValue(mockBook);

      const result = await service.create(createBookDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createBookDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockBook);
      expect(result).toEqual(mockBook);
    });

    it('should create a book with all fields', async () => {
      const createBookDto: CreateBookDto = {
        title: 'El amor en los tiempos del cólera',
        author: 'Gabriel García Márquez',
        year: 1985,
        genre: 'Romance',
        pages: 348,
        read: true,
        rating: 4,
        notes: 'Hermosa historia de amor',
        readDate: '2024-02-01',
      };

      const fullBook = { ...mockBook, ...createBookDto };
      mockRepository.create.mockReturnValue(fullBook);
      mockRepository.save.mockResolvedValue(fullBook);

      const result = await service.create(createBookDto);

      expect(result.title).toBe(createBookDto.title);
      expect(result.author).toBe(createBookDto.author);
    });

    it('should throw BadRequestException for invalid rating', async () => {
      const createBookDto: CreateBookDto = {
        title: 'Test Book',
        author: 'Test Author',
        rating: 6,
      };

      await expect(service.create(createBookDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for invalid year', async () => {
      const createBookDto: CreateBookDto = {
        title: 'Test Book',
        author: 'Test Author',
        year: 3000,
      };

      await expect(service.create(createBookDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for year below minimum', async () => {
      const createBookDto: CreateBookDto = {
        title: 'Test Book',
        author: 'Test Author',
        year: 500,
      };

      await expect(service.create(createBookDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated books with filters object', async () => {
      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toEqual([mockBook]);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(1);
      expect(result.filters).toBeDefined();
    });

    it('should filter books by author', async () => {
      await service.findAll({ author: 'García', page: 1, limit: 10 });
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('book');
    });

    it('should filter books by genre', async () => {
      await service.findAll({ genre: 'Romance', page: 1, limit: 10 });
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('book');
    });

    it('should filter books by status read', async () => {
      await service.findAll({ status: ReadStatus.READ, page: 1, limit: 10 });
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('book');
    });

    it('should filter books by status unread', async () => {
      await service.findAll({ status: ReadStatus.UNREAD, page: 1, limit: 10 });
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('book');
    });

    it('should filter books by minimum rating', async () => {
      await service.findAll({ minRating: 4, page: 1, limit: 10 });
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('book');
    });

    it('should sort books by title ascending', async () => {
      await service.findAll({
        sortBy: 'title',
        sortOrder: SortOrder.ASC,
        page: 1,
        limit: 10,
      });
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('book');
    });

    it('should sort books by rating descending', async () => {
      await service.findAll({
        sortBy: 'rating',
        sortOrder: SortOrder.DESC,
        page: 1,
        limit: 10,
      });
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('book');
    });

    it('should sort books by year ascending', async () => {
      await service.findAll({
        sortBy: 'year',
        sortOrder: SortOrder.ASC,
        page: 1,
        limit: 10,
      });
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('book');
    });

    it('should handle empty results', async () => {
      mockRepository.createQueryBuilder.mockReturnValueOnce({
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
        getMany: jest.fn().mockResolvedValue([]),
        getRawOne: jest.fn().mockResolvedValue(null),
      });

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
    });

    it('should use default sort when invalid sort field provided', async () => {
      await service.findAll({ sortBy: 'invalidField', page: 1, limit: 10 });
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('book');
    });

    it('should apply multiple filters together', async () => {
      await service.findAll({
        author: 'García',
        genre: 'Realismo',
        minRating: 4,
        page: 1,
        limit: 10,
      });
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('book');
    });
  });

  describe('findOne', () => {
    it('should return a book by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockBook);

      const result = await service.findOne(1);

      expect(result).toEqual(mockBook);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException when book not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid id (zero)', async () => {
      await expect(service.findOne(0)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for negative id', async () => {
      await expect(service.findOne(-1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update a book successfully', async () => {
      const updateBookDto: UpdateBookDto = {
        title: 'Nuevo título',
        rating: 4,
      };

      const updatedBook = { ...mockBook, ...updateBookDto };
      mockRepository.findOne.mockResolvedValue(mockBook);
      mockRepository.save.mockResolvedValue(updatedBook);

      const result = await service.update(1, updateBookDto);

      expect(result.title).toBe('Nuevo título');
      expect(result.rating).toBe(4);
    });

    it('should throw NotFoundException when updating non-existent book', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, { title: 'Test' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException for invalid id', async () => {
      await expect(service.update(0, { title: 'Test' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for invalid rating update', async () => {
      mockRepository.findOne.mockResolvedValue(mockBook);

      await expect(service.update(1, { rating: 10 })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for rating below 1', async () => {
      mockRepository.findOne.mockResolvedValue(mockBook);

      await expect(service.update(1, { rating: -1 })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should update only provided fields', async () => {
      const updateBookDto: UpdateBookDto = {
        notes: 'Updated notes',
      };

      const updatedBook = { ...mockBook, notes: 'Updated notes' };
      mockRepository.findOne.mockResolvedValue(mockBook);
      mockRepository.save.mockResolvedValue(updatedBook);

      const result = await service.update(1, updateBookDto);

      expect(result.notes).toBe('Updated notes');
      expect(result.title).toBe(mockBook.title);
    });
  });

  describe('remove', () => {
    it('should remove a book successfully', async () => {
      mockRepository.findOne.mockResolvedValue(mockBook);
      mockRepository.remove.mockResolvedValue(mockBook);

      await service.remove(1);

      expect(mockRepository.remove).toHaveBeenCalledWith(mockBook);
    });

    it('should throw NotFoundException when removing non-existent book', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid id', async () => {
      await expect(service.remove(0)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getStatistics', () => {
    it('should return complete book statistics', async () => {
      mockRepository.count
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(8)
        .mockResolvedValueOnce(2);

      mockRepository.createQueryBuilder.mockImplementation(() => ({
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([
          { title: 'Book 1', rating: 5 },
          { title: 'Book 2', rating: 5 },
          { title: 'Book 3', rating: 5 },
        ]),
        getRawOne: jest
          .fn()
          .mockResolvedValueOnce({ average: '4.5' })
          .mockResolvedValueOnce({ total: '500' })
          .mockResolvedValueOnce({ average: '350' }),
      }));

      const result = await service.getStatistics();

      expect(result.totalBooks).toBe(10);
      expect(result.booksRead).toBe(8);
      expect(result.booksUnread).toBe(2);
      expect(result.averageRating).toBeDefined();
      expect(result.totalPages).toBeDefined();
      expect(result.averagePagesPerBook).toBeDefined();
      expect(result.topRatedBooks).toBeDefined();
    });

    it('should handle null average rating', async () => {
      mockRepository.count.mockResolvedValue(0);

      mockRepository.createQueryBuilder.mockImplementation(() => ({
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
        getRawOne: jest
          .fn()
          .mockResolvedValueOnce({ average: null })
          .mockResolvedValueOnce({ total: null })
          .mockResolvedValueOnce({ average: null }),
      }));

      const result = await service.getStatistics();

      expect(result.averageRating).toBeNull();
      expect(result.totalPages).toBe(0);
      expect(result.averagePagesPerBook).toBeNull();
    });

    it('should calculate booksUnread correctly', async () => {
      mockRepository.count
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(8)
        .mockResolvedValueOnce(2);

      mockRepository.createQueryBuilder.mockImplementation(() => ({
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
        getRawOne: jest
          .fn()
          .mockResolvedValueOnce({ average: '4.0' })
          .mockResolvedValueOnce({ total: '1000' })
          .mockResolvedValueOnce({ average: '200' }),
      }));

      const result = await service.getStatistics();

      expect(result.booksUnread).toBe(2);
    });
  });
});
