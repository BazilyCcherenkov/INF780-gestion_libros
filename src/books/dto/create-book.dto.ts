import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsBoolean,
  IsDateString,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookDto {
  @ApiProperty({
    description: 'Título del libro (requerido)',
    example: 'Cien años de soledad',
    minLength: 1,
    maxLength: 255,
    type: 'string',
  })
  @IsString()
  @MinLength(1, { message: 'El título no puede estar vacío' })
  @MaxLength(255, { message: 'El título no puede exceder 255 caracteres' })
  title: string;

  @ApiProperty({
    description: 'Autor del libro (requerido)',
    example: 'Gabriel García Márquez',
    minLength: 1,
    maxLength: 255,
    type: 'string',
  })
  @IsString()
  @MinLength(1, { message: 'El autor no puede estar vacío' })
  @MaxLength(255, { message: 'El autor no puede exceder 255 caracteres' })
  author: string;

  @ApiPropertyOptional({
    description: 'Año de publicación del libro (1000-2030)',
    example: 1967,
    minimum: 1000,
    maximum: 2030,
    type: 'integer',
  })
  @IsOptional()
  @IsInt({ message: 'El año debe ser un número entero' })
  @Min(1000, { message: 'El año debe ser mayor o igual a 1000' })
  @Max(2030, { message: 'El año debe ser menor o igual a 2030' })
  year?: number;

  @ApiPropertyOptional({
    description: 'Género o categoría del libro',
    example: 'Realismo mágico',
    maxLength: 100,
    type: 'string',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'El género no puede exceder 100 caracteres' })
  genre?: string;

  @ApiPropertyOptional({
    description: 'Número total de páginas del libro',
    example: 417,
    minimum: 1,
    type: 'integer',
  })
  @IsOptional()
  @IsInt({ message: 'Las páginas deben ser un número entero' })
  @Min(1, { message: 'Debe tener al menos 1 página' })
  pages?: number;

  @ApiPropertyOptional({
    description: 'Indica si el libro fue leído completamente',
    example: true,
    type: 'boolean',
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo read debe ser un valor booleano' })
  read?: boolean;

  @ApiPropertyOptional({
    description: 'Calificación personal del libro (1-5 estrellas)',
    example: 5,
    minimum: 1,
    maximum: 5,
    type: 'integer',
    enum: [1, 2, 3, 4, 5],
  })
  @IsOptional()
  @IsInt({ message: 'La calificación debe ser un número entero' })
  @Min(1, { message: 'La calificación mínima es 1' })
  @Max(5, { message: 'La calificación máxima es 5' })
  rating?: number;

  @ApiPropertyOptional({
    description: 'Notas personales u opiniones sobre el libro',
    example:
      'Una obra maestra de la literatura latinoamericana. La narrativa de García Márquez es simplemente fascinante.',
    type: 'string',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Fecha en que se terminó de leer el libro (formato ISO)',
    example: '2024-01-15',
    type: 'string',
    format: 'date',
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha debe estar en formato ISO (YYYY-MM-DD)' },
  )
  readDate?: string;
}
