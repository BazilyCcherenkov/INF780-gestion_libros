import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { QueryBookDto } from './dto/query-book.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiProduces,
} from '@nestjs/swagger';
import { Book } from './entities/book.entity';

@ApiTags('books')
@ApiProduces('application/json')
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear un nuevo libro',
    description:
      'Crea un nuevo libro en el catálogo con validación completa de datos. Los campos título y autor son requeridos.',
  })
  @ApiBody({
    description: 'Datos del libro a crear',
    type: CreateBookDto,
    examples: {
      ejemploCompleto: {
        summary: 'Ejemplo completo',
        description: 'Crear un libro con todos los campos',
        value: {
          title: 'Cien años de soledad',
          author: 'Gabriel García Márquez',
          year: 1967,
          genre: 'Realismo mágico',
          pages: 417,
          read: true,
          rating: 5,
          notes: 'Una obra maestra de la literatura latinoamericana',
          readDate: '2024-01-15',
        },
      },
      ejemploMinimo: {
        summary: 'Ejemplo mínimo',
        description: 'Crear un libro solo con campos requeridos',
        value: {
          title: 'Don Quijote de la Mancha',
          author: 'Miguel de Cervantes',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Libro creado exitosamente',
    schema: {
      example: {
        id: 1,
        title: 'Cien años de soledad',
        author: 'Gabriel García Márquez',
        year: 1967,
        genre: 'Realismo mágico',
        pages: 417,
        read: true,
        rating: 5,
        notes: 'Una obra maestra de la literatura latinoamericana',
        readDate: '2024-01-15T00:00:00.000Z',
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos - Error de validación',
    schema: {
      example: {
        statusCode: 400,
        message: ['title must be a string', 'author should not be empty'],
        error: 'Bad Request',
      },
    },
  })
  async create(@Body() createBookDto: CreateBookDto): Promise<Book> {
    return await this.booksService.create(createBookDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar libros con filtros y paginación',
    description:
      'Retorna una lista paginada de libros con soporte para filtros avanzados y ordenamiento.',
  })
  @ApiQuery({
    name: 'author',
    required: false,
    description: 'Filtrar por autor (búsqueda parcial)',
    example: 'García',
  })
  @ApiQuery({
    name: 'genre',
    required: false,
    description: 'Filtrar por género',
    example: 'Realismo',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['read', 'unread'],
    description: 'Filtrar por estado de lectura',
    example: 'read',
  })
  @ApiQuery({
    name: 'minRating',
    required: false,
    description: 'Calificación mínima (1-5)',
    example: 4,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['title', 'author', 'year', 'rating', 'pages', 'createdAt'],
    description: 'Campo para ordenar',
    example: 'title',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Orden de ordenamiento',
    example: 'asc',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número de página (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Elementos por página (default: 10, max: 100)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de libros paginada',
    schema: {
      example: {
        data: [
          {
            id: 1,
            title: 'Cien años de soledad',
            author: 'Gabriel García Márquez',
            year: 1967,
            genre: 'Realismo mágico',
            pages: 417,
            read: true,
            rating: 5,
            createdAt: '2024-01-15T10:30:00.000Z',
          },
        ],
        total: 25,
        page: 1,
        limit: 10,
        totalPages: 3,
        filters: {
          author: 'García',
          genre: null,
          status: 'read',
          minRating: null,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        },
      },
    },
  })
  async findAll(@Query() queryDto: QueryBookDto) {
    return await this.booksService.findAll(queryDto);
  }

  @Get('statistics')
  @ApiOperation({
    summary: 'Obtener estadísticas de lectura',
    description:
      'Retorna métricas agregadas de los libros en el catálogo: totales, promedios y top rated.',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas de lectura',
    schema: {
      example: {
        totalBooks: 25,
        booksRead: 18,
        booksUnread: 7,
        averageRating: 4.2,
        totalPages: 8540,
        averagePagesPerBook: 341.6,
        topRatedBooks: [
          { title: 'Cien años de soledad', rating: 5 },
          { title: 'El amor en los tiempos del cólera', rating: 5 },
          { title: 'Don Quijote de la Mancha', rating: 5 },
        ],
      },
    },
  })
  async getStatistics() {
    return await this.booksService.getStatistics();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener un libro por ID',
    description:
      'Retorna los detalles de un libro específico usando su identificador único.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador único del libro',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Libro encontrado',
    type: Book,
  })
  @ApiResponse({
    status: 404,
    description: 'Libro no encontrado',
    schema: {
      example: {
        statusCode: 404,
        message: 'Libro con ID 999 no encontrado',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'ID inválido',
    schema: {
      example: {
        statusCode: 400,
        message: 'El ID debe ser un número positivo',
        error: 'Bad Request',
      },
    },
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Book> {
    return await this.booksService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar un libro',
    description:
      'Actualiza parcialmente los datos de un libro existente. Solo los campos proporcionados serán actualizados.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador único del libro',
    example: 1,
  })
  @ApiBody({
    description: 'Campos a actualizar (parcial)',
    type: UpdateBookDto,
    examples: {
      actualizarCalificacion: {
        summary: 'Actualizar calificación',
        value: { rating: 4 },
      },
      actualizarNotas: {
        summary: 'Actualizar notas',
        value: { notes: 'Excelente lectura, muy recomendado' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Libro actualizado exitosamente',
    type: Book,
  })
  @ApiResponse({
    status: 404,
    description: 'Libro no encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBookDto: UpdateBookDto,
  ): Promise<Book> {
    return await this.booksService.update(id, updateBookDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar un libro',
    description:
      'Elimina permanentemente un libro del catálogo. Esta acción no se puede deshacer.',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador único del libro a eliminar',
    example: 1,
  })
  @ApiResponse({
    status: 204,
    description: 'Libro eliminado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Libro no encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'ID inválido',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.booksService.remove(id);
  }
}
