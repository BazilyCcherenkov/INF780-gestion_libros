import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppModule } from './../src/app.module';
import { Book } from './../src/books/entities/book.entity';

describe('BooksController E2E Tests (Practica 2)', () => {
  let app: INestApplication;
  let bookRepository: any;

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
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    await app.init();

    bookRepository = moduleFixture.get(getRepositoryToken(Book));
    await bookRepository.clear();
  });

  afterAll(async () => {
    await bookRepository.clear();
    await app.close();
  });

  afterEach(async () => {
    await bookRepository.clear();
  });

  describe('POST /books - Crear libro', () => {
    it('Caso 1: Crear libro con datos válidos → 201', async () => {
      const response = await request(app.getHttpServer())
        .post('/books')
        .send(validBook)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(validBook.title);
      expect(response.body.author).toBe(validBook.author);
      expect(response.body.year).toBe(validBook.year);
    });

    it('Caso 2: Crear libro sin título (campo obligatorio) → 400', async () => {
      await request(app.getHttpServer())
        .post('/books')
        .send({ author: 'Test Author' })
        .expect(400);
    });

    it('Caso 3: Crear libro sin autor (campo obligatorio) → 400', async () => {
      await request(app.getHttpServer())
        .post('/books')
        .send({ title: 'Test Title' })
        .expect(400);
    });

    it('Caso 4: Crear libro con número de páginas negativo → 400', async () => {
      await request(app.getHttpServer())
        .post('/books')
        .send({ ...validBook, pages: -10 })
        .expect(400);
    });
  });

  describe('GET /books - Listar libros', () => {
    it('Caso 5: Listar todos los libros cuando existen registros → 200', async () => {
      await request(app.getHttpServer()).post('/books').send(validBook);

      const response = await request(app.getHttpServer())
        .get('/books')
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.total).toBeGreaterThan(0);
    });

    it('Caso 6: Listar libros cuando no hay registros → 200 (array vacío)', async () => {
      const response = await request(app.getHttpServer())
        .get('/books')
        .expect(200);

      expect(response.body.data).toHaveLength(0);
      expect(response.body.total).toBe(0);
    });
  });

  describe('GET /books/:id - Obtener libro por ID', () => {
    let bookId: number;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/books')
        .send(validBook);
      bookId = response.body.id;
    });

    it('Caso 7: Obtener libro existente por ID → 200', async () => {
      const response = await request(app.getHttpServer())
        .get(`/books/${bookId}`)
        .expect(200);

      expect(response.body.id).toBe(bookId);
      expect(response.body.title).toBe(validBook.title);
    });

    it('Caso 8: Obtener libro con ID inexistente → 404', async () => {
      await request(app.getHttpServer()).get('/books/99999').expect(404);
    });

    it('Caso 9: Obtener libro con ID inválido (formato incorrecto) → 400', async () => {
      await request(app.getHttpServer()).get('/books/abc').expect(400);
    });
  });

  describe('PATCH /books/:id - Actualizar libro', () => {
    let bookId: number;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/books')
        .send(validBook);
      bookId = response.body.id;
    });

    it('Caso 10: Actualizar título de un libro existente → 200', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/books/${bookId}`)
        .send({ title: 'Nuevo Título' })
        .expect(200);

      expect(response.body.title).toBe('Nuevo Título');
    });

    it('Caso 11: Actualizar libro con ID inexistente → 404', async () => {
      await request(app.getHttpServer())
        .patch('/books/99999')
        .send({ title: 'Test' })
        .expect(404);
    });

    it('Caso 12: Actualizar con datos inválidos (páginas negativas) → 400', async () => {
      await request(app.getHttpServer())
        .patch(`/books/${bookId}`)
        .send({ pages: -50 })
        .expect(400);
    });
  });

  describe('DELETE /books/:id - Eliminar libro', () => {
    let bookId: number;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/books')
        .send(validBook);
      bookId = response.body.id;
    });

    it('Caso 13: Eliminar libro existente → 204', async () => {
      await request(app.getHttpServer()).delete(`/books/${bookId}`).expect(204);

      await request(app.getHttpServer()).get(`/books/${bookId}`).expect(404);
    });

    it('Caso 14: Eliminar libro con ID inexistente → 404', async () => {
      await request(app.getHttpServer()).delete('/books/99999').expect(404);
    });
  });

  describe('Caso 15: Flujo completo CRUD', () => {
    it('Crear → Leer → Actualizar → Verificar cambio → Eliminar → Verificar 404', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/books')
        .send({
          title: 'El Gran Gatsby',
          author: 'F. Scott Fitzgerald',
          year: 1925,
          pages: 180,
        })
        .expect(201);

      const bookId = createResponse.body.id;

      const readResponse = await request(app.getHttpServer())
        .get(`/books/${bookId}`)
        .expect(200);
      expect(readResponse.body.author).toBe('F. Scott Fitzgerald');

      const updateResponse = await request(app.getHttpServer())
        .patch(`/books/${bookId}`)
        .send({ read: true, rating: 5 })
        .expect(200);
      expect(updateResponse.body.read).toBe(true);
      expect(updateResponse.body.rating).toBe(5);

      const verifyUpdate = await request(app.getHttpServer())
        .get(`/books/${bookId}`)
        .expect(200);
      expect(verifyUpdate.body.rating).toBe(5);

      await request(app.getHttpServer()).delete(`/books/${bookId}`).expect(204);

      await request(app.getHttpServer()).get(`/books/${bookId}`).expect(404);
    });
  });

  describe('GET /books/statistics - Estadísticas', () => {
    it('Obtener estadísticas con datos → 200', async () => {
      await request(app.getHttpServer()).post('/books').send(validBook);

      const response = await request(app.getHttpServer())
        .get('/books/statistics')
        .expect(200);

      expect(response.body.totalBooks).toBeGreaterThan(0);
      expect(response.body).toHaveProperty('averageRating');
      expect(response.body).toHaveProperty('topRatedBooks');
    });

    it('Obtener estadísticas sin datos → 200', async () => {
      const response = await request(app.getHttpServer())
        .get('/books/statistics')
        .expect(200);

      expect(response.body.totalBooks).toBe(0);
    });
  });
});
