import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateEpisodeDto {
  @ApiProperty({ description: 'Номер сезона', example: 1, minimum: 1 })
  @IsInt()
  @Min(1)
  seasonNumber: number;

  @ApiProperty({ description: 'Номер эпизода', example: 1, minimum: 1 })
  @IsInt()
  @Min(1)
  episodeNumber: number;

  @ApiProperty({ description: 'Название эпизода', example: 'Пилот' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Длительность в минутах',
    example: 42,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  duration: number;

  @ApiPropertyOptional({ description: 'Описание эпизода' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Дата выхода', example: '2024-01-15' })
  @IsOptional()
  airDate?: string;
}
