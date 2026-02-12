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
  @IsString({ message: 'Полное имя должно быть строкой' })
  @IsNotEmpty({ message: 'Полное имя обязательно' })
  @MinLength(2, { message: 'Полное имя должно содержать минимум 2 символа' })
  @MaxLength(120, { message: 'Полное имя не должно превышать 120 символов' })
  fullname: string;

  @IsOptional()
  @IsUrl()
  photoUrl?: string;

  @IsString({ message: 'Биография должна быть строкой' })
  @IsOptional()
  biography?: string;

  @ApiPropertyOptional({
    description: 'Дата рождения в формате ISO 8601',
    example: '1970-07-30',
    format: 'date',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return null;
    if (typeof value === 'string' && value.includes('-')) {
      const parts = value.split('-');
      if (parts.length === 3) {
        const [day, month, year] = parts;
        return new Date(`${year}-${month}-${day}T00:00:00.000Z`).toISOString();
      }
    }
    return value;
  })
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({
    description: 'Дата смерти в формате ISO 8601',
    example: null,
    format: 'date',
    nullable: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value || value === 'null' || value === '') return null;
    if (typeof value === 'string' && value.includes('-')) {
      const parts = value.split('-');
      if (parts.length === 3) {
        const [day, month, year] = parts;
        return new Date(`${year}-${month}-${day}T00:00:00.000Z`).toISOString();
      }
    }
    return value;
  })
  @IsDateString()
  deathDate?: string | null;
}
