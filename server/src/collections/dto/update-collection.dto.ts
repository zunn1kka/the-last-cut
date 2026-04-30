import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateCollectionDto {
  @ApiPropertyOptional({ description: 'Название сборника' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  title?: string;

  @ApiPropertyOptional({ description: 'Описание сборника' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Публичный ли сборник' })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
