import { IsOptional, IsInt, Min, Max, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export enum ReadStatus {
  READ = 'read',
  UNREAD = 'unread',
}

export class QueryBookDto {
  @ApiPropertyOptional({
    description: 'Filtrar por autor (búsqueda parcial)',
    example: 'García',
  })
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  author?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por género (búsqueda parcial)',
    example: 'Realismo',
  })
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  genre?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por estado de lectura',
    enum: ReadStatus,
    example: 'read',
  })
  @IsOptional()
  @IsEnum(ReadStatus)
  status?: ReadStatus;

  @ApiPropertyOptional({
    description: 'Filtrar por calificación mínima (1-5)',
    example: 4,
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  minRating?: number;

  @ApiPropertyOptional({
    description: 'Campo por el cual ordenar',
    example: 'title',
    enum: ['title', 'author', 'year', 'rating', 'pages', 'createdAt'],
  })
  @IsOptional()
  @Transform(({ value }) => value?.trim().toLowerCase())
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Orden de ordenamiento',
    enum: SortOrder,
    example: 'asc',
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;

  @ApiPropertyOptional({
    description: 'Número de página',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Elementos por página (máximo 100)',
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
