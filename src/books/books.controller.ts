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
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Book } from './entities/book.entity';

@ApiTags('books')
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo libro' })
  @ApiResponse({ status: 201, description: 'Libro creado exitosamente', type: Book })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async create(@Body() createBookDto: CreateBookDto): Promise<Book> {
    return await this.booksService.create(createBookDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los libros con paginación y filtros' })
  @ApiResponse({ status: 200, description: 'Lista de libros' })
  async findAll(@Query() queryDto: QueryBookDto) {
    return await this.booksService.findAll(queryDto);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Obtener estadísticas de lectura' })
  @ApiResponse({ status: 200, description: 'Estadísticas de libros' })
  async getStatistics() {
    return await this.booksService.getStatistics();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un libro por ID' })
  @ApiParam({ name: 'id', description: 'ID del libro' })
  @ApiResponse({ status: 200, description: 'Libro encontrado', type: Book })
  @ApiResponse({ status: 404, description: 'Libro no encontrado' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Book> {
    return await this.booksService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un libro' })
  @ApiParam({ name: 'id', description: 'ID del libro' })
  @ApiResponse({ status: 200, description: 'Libro actualizado', type: Book })
  @ApiResponse({ status: 404, description: 'Libro no encontrado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBookDto: UpdateBookDto,
  ): Promise<Book> {
    return await this.booksService.update(id, updateBookDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un libro' })
  @ApiParam({ name: 'id', description: 'ID del libro' })
  @ApiResponse({ status: 204, description: 'Libro eliminado' })
  @ApiResponse({ status: 404, description: 'Libro no encontrado' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.booksService.remove(id);
  }
}
