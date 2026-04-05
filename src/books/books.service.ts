import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from './entities/book.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { QueryBookDto, SortOrder, ReadStatus } from './dto/query-book.dto';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
  ) {}

  async create(createBookDto: CreateBookDto): Promise<Book> {
    if (
      createBookDto.rating &&
      (createBookDto.rating < 1 || createBookDto.rating > 5)
    ) {
      throw new BadRequestException('La calificación debe estar entre 1 y 5');
    }
    if (
      createBookDto.year &&
      (createBookDto.year < 1000 || createBookDto.year > 2030)
    ) {
      throw new BadRequestException('El año debe estar entre 1000 y 2030');
    }
    const book = this.bookRepository.create(createBookDto);
    return await this.bookRepository.save(book);
  }

  async findAll(queryDto: QueryBookDto): Promise<{
    data: Book[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    filters: Record<string, any>;
  }> {
    const {
      author,
      genre,
      status,
      minRating,
      sortBy = 'createdAt',
      sortOrder = SortOrder.DESC,
      page = 1,
      limit = 10,
    } = queryDto;

    const queryBuilder = this.bookRepository.createQueryBuilder('book');

    if (author) {
      queryBuilder.andWhere('LOWER(book.author) LIKE LOWER(:author)', {
        author: `%${author}%`,
      });
    }

    if (genre) {
      queryBuilder.andWhere('LOWER(book.genre) LIKE LOWER(:genre)', {
        genre: `%${genre}%`,
      });
    }

    if (status === ReadStatus.READ) {
      queryBuilder.andWhere('book.read = :read', { read: true });
    } else if (status === ReadStatus.UNREAD) {
      queryBuilder.andWhere('book.read = :read', { read: false });
    }

    if (minRating) {
      queryBuilder.andWhere('book.rating >= :minRating', { minRating });
    }

    const total = await queryBuilder.getCount();

    const allowedSortFields = [
      'title',
      'author',
      'year',
      'rating',
      'pages',
      'createdAt',
    ];
    const sortField = allowedSortFields.includes(sortBy)
      ? `book.${sortBy}`
      : 'book.createdAt';

    queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy(sortField, sortOrder.toUpperCase() as 'ASC' | 'DESC');

    const data = await queryBuilder.getMany();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      filters: { author, genre, status, minRating, sortBy, sortOrder },
    };
  }

  async findOne(id: number): Promise<Book> {
    if (id <= 0) {
      throw new BadRequestException('El ID debe ser un número positivo');
    }
    const book = await this.bookRepository.findOne({ where: { id } });
    if (!book) {
      throw new NotFoundException(`Libro con ID ${id} no encontrado`);
    }
    return book;
  }

  async update(id: number, updateBookDto: UpdateBookDto): Promise<Book> {
    if (id <= 0) {
      throw new BadRequestException('El ID debe ser un número positivo');
    }
    if (
      updateBookDto.rating &&
      (updateBookDto.rating < 1 || updateBookDto.rating > 5)
    ) {
      throw new BadRequestException('La calificación debe estar entre 1 y 5');
    }
    const book = await this.findOne(id);
    Object.assign(book, updateBookDto);
    return await this.bookRepository.save(book);
  }

  async remove(id: number): Promise<void> {
    if (id <= 0) {
      throw new BadRequestException('El ID debe ser un número positivo');
    }
    const book = await this.findOne(id);
    await this.bookRepository.remove(book);
  }

  async getStatistics(): Promise<{
    totalBooks: number;
    booksRead: number;
    booksUnread: number;
    averageRating: number | null;
    totalPages: number;
    averagePagesPerBook: number | null;
    topRatedBooks: { title: string; rating: number }[];
  }> {
    const totalBooks = await this.bookRepository.count();
    const booksRead = await this.bookRepository.count({
      where: { read: true },
    });
    const booksUnread = await this.bookRepository.count({
      where: { read: false },
    });

    const avgResult = await this.bookRepository
      .createQueryBuilder('book')
      .select('AVG(book.rating)', 'average')
      .where('book.rating IS NOT NULL')
      .getRawOne();

    const totalPagesResult = await this.bookRepository
      .createQueryBuilder('book')
      .select('SUM(book.pages)', 'total')
      .getRawOne();

    const avgPagesResult = await this.bookRepository
      .createQueryBuilder('book')
      .select('AVG(book.pages)', 'average')
      .where('book.pages IS NOT NULL')
      .getRawOne();

    const topRated = await this.bookRepository
      .createQueryBuilder('book')
      .select(['book.title', 'book.rating'])
      .where('book.rating IS NOT NULL')
      .orderBy('book.rating', 'DESC')
      .limit(3)
      .getMany();

    return {
      totalBooks,
      booksRead,
      booksUnread,
      averageRating: avgResult.average
        ? parseFloat(parseFloat(avgResult.average).toFixed(2))
        : null,
      totalPages: totalPagesResult.total ? parseInt(totalPagesResult.total) : 0,
      averagePagesPerBook: avgPagesResult.average
        ? parseFloat(parseFloat(avgPagesResult.average).toFixed(2))
        : null,
      topRatedBooks: topRated.map((b) => ({
        title: b.title,
        rating: b.rating,
      })),
    };
  }
}
