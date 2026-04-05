import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { BooksService } from './books.service';
import { Book } from './entities/book.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

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

  const mockQueryBuilder = {
    andWhere: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getCount: jest.fn().mockResolvedValue(1),
    getMany: jest.fn().mockResolvedValue([mockBook]),
    getRawOne: jest.fn().mockResolvedValue({ average: '4.5', total: '500' }),
  };

  const mockRepository: any = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(() => ({ ...mockQueryBuilder })),
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
    it('should create a new book', async () => {
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
  });

  describe('findAll', () => {
    it('should return paginated books', async () => {
      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toEqual([mockBook]);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(1);
    });

    it('should filter books by author', async () => {
      await service.findAll({ author: 'García', page: 1, limit: 10 });
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('book');
    });

    it('should filter books by genre', async () => {
      await service.findAll({ genre: 'Romance', page: 1, limit: 10 });
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('book');
    });

    it('should filter books by read status', async () => {
      await service.findAll({ read: true, page: 1, limit: 10 });
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('book');
    });

    it('should filter books by minimum rating', async () => {
      await service.findAll({ minRating: 4, page: 1, limit: 10 });
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
  });

  describe('update', () => {
    it('should update a book', async () => {
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
  });

  describe('remove', () => {
    it('should remove a book', async () => {
      mockRepository.findOne.mockResolvedValue(mockBook);
      mockRepository.remove.mockResolvedValue(mockBook);

      await service.remove(1);

      expect(mockRepository.remove).toHaveBeenCalledWith(mockBook);
    });

    it('should throw NotFoundException when removing non-existent book', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getStatistics', () => {
    it('should return book statistics', async () => {
      mockRepository.count.mockResolvedValueOnce(10).mockResolvedValueOnce(8);

      const result = await service.getStatistics();

      expect(result.totalBooks).toBe(10);
      expect(result.booksRead).toBe(8);
    });

    it('should handle null average rating', async () => {
      mockRepository.createQueryBuilder.mockImplementation(() => ({
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn()
          .mockResolvedValueOnce({ average: null })
          .mockResolvedValueOnce({ total: null }),
      }));
      mockRepository.count.mockResolvedValueOnce(0);

      const result = await service.getStatistics();

      expect(result.averageRating).toBeNull();
      expect(result.totalPages).toBe(0);
    });
  });
});
