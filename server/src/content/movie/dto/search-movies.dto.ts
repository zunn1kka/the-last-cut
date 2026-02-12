// src/movie/dto/search-movies.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class SearchMoviesDto {
  @ApiPropertyOptional({
    description: 'Поиск по названию фильма',
    example: 'матрица',
  })
  @IsOptional()
  @IsString()
  @MinLength(1, {
    message: 'Поисковый запрос должен содержать минимум 1 символ',
  })
  @MaxLength(100, {
    message: 'Поисковый запрос не должен превышать 100 символов',
  })
  query?: string;

  @ApiPropertyOptional({
    description: 'Номер страницы',
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Количество элементов на странице',
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;
}
