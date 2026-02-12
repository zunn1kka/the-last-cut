import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { ContentType } from 'generated/prisma/enums';
import { PersonDto } from './person.dto';

export class BaseContentDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  originalTitle?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(1900)
  @Max(new Date().getFullYear() + 5)
  @IsOptional()
  releaseYear?: number;

  @IsString()
  @IsOptional()
  posterUrl?: string;

  @IsString()
  @IsOptional()
  backdropUrl?: string;

  @IsNumber()
  @Min(0)
  @Max(10)
  @IsOptional()
  imdbRating?: number;

  @IsNumber()
  @Min(0)
  @Max(10)
  @IsOptional()
  kinopoiskRating?: number;

  @IsString()
  @IsOptional()
  ageRating?: string;

  @IsEnum(ContentType)
  @IsOptional()
  contentType?: ContentType;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  genreIds?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PersonDto)
  @IsOptional()
  persons?: PersonDto[];
}
