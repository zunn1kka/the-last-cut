import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ContentTypeFilter } from 'src/lib/common/enums/content-type-filter.enum';
import { SortByField } from 'src/lib/common/enums/sort-by-filed.enum';
import { SortOrder } from 'src/lib/common/enums/sort-order.enum';

export class FindAllContentDto {
  @ApiPropertyOptional({
    description: 'Номер страницы',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Количество элементов на странице',
    example: 20,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Тип контента',
    enum: ContentTypeFilter,
    example: ContentTypeFilter.MOVIE,
  })
  @IsOptional()
  @IsEnum(ContentTypeFilter)
  contentType?: ContentTypeFilter;

  @ApiPropertyOptional({
    description: 'ID жанров (через запятую или массив)',
    example: ['68abd1af-04c9-4248-81fa-a8f803c0a7e4'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',');
    }
    return value;
  })
  genreIds?: string[];

  @ApiPropertyOptional({
    description: 'Год выпуска от',
    example: 2000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  yearFrom?: number;

  @ApiPropertyOptional({
    description: 'Год выпуска до',
    example: 2024,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  yearTo?: number;

  @ApiPropertyOptional({
    description: 'Рейтинг от',
    example: 7,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  ratingFrom?: number;

  @ApiPropertyOptional({
    description: 'Рейтинг до',
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  ratingTo?: number;

  @ApiPropertyOptional({
    description: 'Поле для сортировки',
    enum: SortByField,
    default: SortByField.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(SortByField)
  sortBy?: SortByField = SortByField.CREATED_AT;

  @ApiPropertyOptional({
    description: 'Порядок сортировки',
    enum: SortOrder,
    default: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;

  @ApiPropertyOptional({
    description: 'Поисковый запрос',
    example: 'интерстеллар',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
