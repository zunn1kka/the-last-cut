import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class AddItemDto {
  @ApiProperty({ description: 'ID контента (фильма/сериала)' })
  contentId: string;

  @ApiPropertyOptional({ description: 'Заметка о фильме' })
  @IsOptional()
  @IsString()
  notes?: string;
}
