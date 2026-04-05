import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from './entities/book.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { QueryBookDto } from './dto/query-book.dto';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
  ) {}

  async create(createBookDto: CreateBookDto): Promise<Book> {
    const book = this.bookRepository.create(createBookDto);
    return await this.bookRepository.save(book);
  }

  async findAll(queryDto: QueryBookDto): Promise<{
    data: Book[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { author, genre, read, minRating, page = 1, limit = 10 } = queryDto;

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

    if (read !== undefined) {
      queryBuilder.andWhere('book.read = :read', { read });
    }

    if (minRating) {
      queryBuilder.andWhere('book.rating >= :minRating', { minRating });
    }

    const total = await queryBuilder.getCount();

    queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('book.createdAt', 'DESC');

    const data = await queryBuilder.getMany();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<Book> {
    const book = await this.bookRepository.findOne({ where: { id } });
    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }
    return book;
  }

  async update(id: number, updateBookDto: UpdateBookDto): Promise<Book> {
    const book = await this.findOne(id);
    Object.assign(book, updateBookDto);
    return await this.bookRepository.save(book);
  }

  async remove(id: number): Promise<void> {
    const book = await this.findOne(id);
    await this.bookRepository.remove(book);
  }

  async getStatistics(): Promise<{
    totalBooks: number;
    booksRead: number;
    booksUnread: number;
    averageRating: number | null;
    totalPages: number;
  }> {
    const totalBooks = await this.bookRepository.count();
    const booksRead = await this.bookRepository.count({ where: { read: true } });
    const booksUnread = await this.bookRepository.count({ where: { read: false } });

    const avgResult = await this.bookRepository
      .createQueryBuilder('book')
      .select('AVG(book.rating)', 'average')
      .where('book.rating IS NOT NULL')
      .getRawOne();

    const totalPagesResult = await this.bookRepository
      .createQueryBuilder('book')
      .select('SUM(book.pages)', 'total')
      .getRawOne();

    return {
      totalBooks,
      booksRead,
      booksUnread,
      averageRating: avgResult.average ? parseFloat(avgResult.average) : null,
      totalPages: totalPagesResult.total ? parseInt(totalPagesResult.total) : 0,
    };
  }
}
