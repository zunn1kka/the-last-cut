import { ApiProperty } from '@nestjs/swagger';
import {
  IsLowercase,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateGenreDto {
  @ApiProperty({
    description: 'Название жанра',
    example: 'Фантастика',
    minLength: 2,
    maxLength: 50,
  })
  @IsString({ message: 'Название должно быть строкой' })
  @IsNotEmpty({ message: 'Название жанра обязательно' })
  @MinLength(2, { message: 'Название должно содержать минимум 2 символа' })
  @MaxLength(50, { message: 'Название не должно превышать 50 символов' })
  name: string;

  @ApiProperty({
    description: 'URL-дружественный идентификатор жанра',
    example: 'sci-fi',
    minLength: 2,
    maxLength: 50,
  })
  @IsString({ message: 'Slug должен быть строкой' })
  @IsNotEmpty({ message: 'Slug обязателен' })
  @MinLength(2, { message: 'Slug должен содержать минимум 2 символа' })
  @MaxLength(50, { message: 'Slug не должен превышать 50 символов' })
  @Matches(/^[a-z0-9-]+$/, {
    message:
      'Slug может содержать только латинские буквы в нижнем регистре, цифры и дефисы',
  })
  @IsLowercase({ message: 'Slug должен быть в нижнем регистре' })
  slug: string;
}
