import { IsString, IsOptional, IsInt, Min, Max, IsBoolean, IsDateString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookDto {
  @ApiProperty({
    description: 'Título del libro',
    example: 'Cien años de soledad',
    minLength: 1,
    maxLength: 255,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title: string;

  @ApiProperty({
    description: 'Autor del libro',
    example: 'Gabriel García Márquez',
    minLength: 1,
    maxLength: 255,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  author: string;

  @ApiPropertyOptional({
    description: 'Año de publicación',
    example: 1967,
    minimum: 1000,
    maximum: 2030,
  })
  @IsOptional()
  @IsInt()
  @Min(1000)
  @Max(2030)
  year?: number;

  @ApiPropertyOptional({
    description: 'Género del libro',
    example: 'Realismo mágico',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  genre?: string;

  @ApiPropertyOptional({
    description: 'Número de páginas',
    example: 417,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  pages?: number;

  @ApiPropertyOptional({
    description: '¿El libro fue leído completamente?',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  read?: boolean;

  @ApiPropertyOptional({
    description: 'Calificación del 1 al 5',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({
    description: 'Notas u opiniones sobre el libro',
    example: 'Una obra maestra de la literatura latinoamericana',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Fecha de lectura',
    example: '2024-01-15',
  })
  @IsOptional()
  @IsDateString()
  readDate?: string;
}
