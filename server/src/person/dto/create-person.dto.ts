// src/person/dto/create-person.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreatePersonDto {
  @ApiProperty({
    description: 'Полное имя персоны',
    example: 'Кристофер Нолан',
    minLength: 2,
    maxLength: 120,
  })
  @IsString()
  @IsNotEmpty({ message: 'Полное имя обязательно' })
  @MinLength(2, { message: 'Полное имя должно содержать минимум 2 символа' })
  @MaxLength(120, { message: 'Полное имя не должно превышать 120 символов' })
  fullname: string;

  @IsOptional()
  @IsUrl()
  photoUrl?: string;

  @IsString()
  @IsOptional()
  biography?: string;

  @ApiPropertyOptional({
    description: 'Дата рождения в формате ISO 8601',
    example: '1970-07-30',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return null;

    // Если это строка, пробуем преобразовать
    if (typeof value === 'string') {
      // Пробуем распарсить дату
      const date = new Date(value);

      // Проверяем, что дата валидна
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
    }

    return value;
  })
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({
    description: 'Дата смерти',
    example: null,
    nullable: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value || value === 'null' || value === '') return null;

    if (typeof value === 'string') {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
    }

    return value;
  })
  @IsDateString()
  deathDate?: string | null;
}
