import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateCollectionDto {
  @ApiProperty({ description: 'Название сборника', example: 'Любимые фильмы' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  title: string;

  @ApiPropertyOptional({ description: 'Описание сборника' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Публичный ли сборник', default: true })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
