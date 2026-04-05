import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('books')
export class Book {
  @ApiProperty({ description: 'Identificador único del libro' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Título del libro', example: 'Cien años de soledad' })
  @Column({ length: 255 })
  title: string;

  @ApiProperty({ description: 'Autor del libro', example: 'Gabriel García Márquez' })
  @Column({ length: 255 })
  author: string;

  @ApiProperty({ description: 'Año de publicación', example: 1967 })
  @Column({ type: 'int', nullable: true })
  year: number;

  @ApiProperty({ description: 'Género del libro', example: 'Realismo mágico' })
  @Column({ length: 100, nullable: true })
  genre: string;

  @ApiProperty({ description: 'Número de páginas', example: 417 })
  @Column({ type: 'int', nullable: true })
  pages: number;

  @ApiProperty({ description: '¿El libro fue leído completamente?', example: true })
  @Column({ default: false })
  read: boolean;

  @ApiProperty({ description: 'Calificación del 1 al 5', example: 5, minimum: 1, maximum: 5 })
  @Column({ type: 'int', nullable: true })
  rating: number;

  @ApiProperty({ description: 'Notas u opiniones sobre el libro', example: 'Una obra maestra de la literatura latinoamericana' })
  @Column({ type: 'text', nullable: true })
  notes: string;

  @ApiProperty({ description: 'Fecha de lectura', example: '2024-01-15' })
  @Column({ type: 'date', nullable: true })
  readDate: Date;

  @ApiProperty({ description: 'Fecha de creación del registro' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de última actualización' })
  @UpdateDateColumn()
  updatedAt: Date;
}
