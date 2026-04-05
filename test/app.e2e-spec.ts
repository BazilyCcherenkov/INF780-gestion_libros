import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('BooksController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const validBook = {
    title: 'Cien años de soledad',
    author: 'Gabriel García Márquez',
    year: 1967,
    genre: 'Realismo mágico',
    pages: 417,
    read: true,
    rating: 5,
    notes: 'Obra maestra de la literatura',
    readDate: '2024-01-15',
  };

  let createdBookId: number;

  describe('/books (POST)', () => {
    it('should create a new book', () => {
      return request(app.getHttpServer())
        .post('/books')
        .send(validBook)
        .expect(201)
        .expect((res) => {
          expect(res.body.title).toBe(validBook.title);
          expect(res.body.author).toBe(validBook.author);
          expect(res.body.year).toBe(validBook.year);
          createdBookId = res.body.id;
        });
    });

    it('should reject book without title', () => {
      return request(app.getHttpServer())
        .post('/books')
        .send({ author: 'Test Author' })
        .expect(400);
    });

    it('should reject book without author', () => {
      return request(app.getHttpServer())
        .post('/books')
        .send({ title: 'Test Title' })
        .expect(400);
    });

    it('should reject book with invalid rating', () => {
      return request(app.getHttpServer())
        .post('/books')
        .send({ ...validBook, rating: 6 })
        .expect(400);
    });

    it('should reject book with invalid year', () => {
      return request(app.getHttpServer())
        .post('/books')
        .send({ ...validBook, year: 3000 })
        .expect(400);
    });

    it('should create book with only required fields', () => {
      return request(app.getHttpServer())
        .post('/books')
        .send({ title: 'Test Book', author: 'Test Author' })
        .expect(201);
    });
  });

  describe('/books (GET)', () => {
    it('should return paginated books', () => {
      return request(app.getHttpServer())
        .get('/books')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('page');
          expect(res.body).toHaveProperty('limit');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should filter books by author', () => {
      return request(app.getHttpServer())
        .get('/books?author=García')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should filter books by genre', () => {
      return request(app.getHttpServer())
        .get('/books?genre=Realismo')
        .expect(200);
    });

    it('should filter books by read status', () => {
      return request(app.getHttpServer())
        .get('/books?read=true')
        .expect(200);
    });

    it('should filter books by minimum rating', () => {
      return request(app.getHttpServer())
        .get('/books?minRating=4')
        .expect(200);
    });

    it('should paginate results', () => {
      return request(app.getHttpServer())
        .get('/books?page=1&limit=5')
        .expect(200)
        .expect((res) => {
          expect(res.body.page).toBe(1);
          expect(res.body.limit).toBe(5);
        });
    });
  });

  describe('/books/statistics (GET)', () => {
    it('should return book statistics', () => {
      return request(app.getHttpServer())
        .get('/books/statistics')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('totalBooks');
          expect(res.body).toHaveProperty('booksRead');
          expect(res.body).toHaveProperty('booksUnread');
          expect(res.body).toHaveProperty('averageRating');
          expect(res.body).toHaveProperty('totalPages');
        });
    });
  });

  describe('/books/:id (GET)', () => {
    it('should return a book by id', () => {
      return request(app.getHttpServer())
        .get(`/books/${createdBookId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdBookId);
          expect(res.body.title).toBe(validBook.title);
        });
    });

    it('should return 404 for non-existent book', () => {
      return request(app.getHttpServer())
        .get('/books/99999')
        .expect(404);
    });
  });

  describe('/books/:id (PATCH)', () => {
    it('should update a book', () => {
      return request(app.getHttpServer())
        .patch(`/books/${createdBookId}`)
        .send({ title: 'Nuevo título', rating: 4 })
        .expect(200)
        .expect((res) => {
          expect(res.body.title).toBe('Nuevo título');
          expect(res.body.rating).toBe(4);
        });
    });

    it('should return 404 when updating non-existent book', () => {
      return request(app.getHttpServer())
        .patch('/books/99999')
        .send({ title: 'Test' })
        .expect(404);
    });

    it('should reject update with invalid data', () => {
      return request(app.getHttpServer())
        .patch(`/books/${createdBookId}`)
        .send({ rating: 10 })
        .expect(400);
    });
  });

  describe('/books/:id (DELETE)', () => {
    it('should delete a book', () => {
      return request(app.getHttpServer())
        .delete(`/books/${createdBookId}`)
        .expect(204);
    });

    it('should return 404 when deleting non-existent book', () => {
      return request(app.getHttpServer())
        .delete('/books/99999')
        .expect(404);
    });

    it('should verify book was deleted', () => {
      return request(app.getHttpServer())
        .get(`/books/${createdBookId}`)
        .expect(404);
    });
  });
});
