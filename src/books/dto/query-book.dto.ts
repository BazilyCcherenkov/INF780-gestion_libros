import { IsOptional, IsInt, Min, Max, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryBookDto {
  @ApiPropertyOptional({
    description: 'Filtrar por autor',
    example: 'Gabriel García Márquez',
  })
  @IsOptional()
  author?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por género',
    example: 'Realismo mágico',
  })
  @IsOptional()
  genre?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por si fue leído',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  read?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrar por calificación mínima',
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
    description: 'Número de página para paginación',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Cantidad de elementos por página',
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
