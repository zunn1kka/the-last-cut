import { OmitType, PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateSeriesDto } from './create-series.dto';

export class UpdateSeriesDto extends PartialType(
  OmitType(CreateSeriesDto, ['contentType'] as const),
) {
  @ApiPropertyOptional({
    description: 'URL постера',
    example: 'affc65d03767c31c7bf8ecd2141eb165.jpg',
  })
  posterUrl?: string;

  @ApiPropertyOptional({
    description: 'URL фонового изображения',
    example: 'c3f8a7e8a3a93004067285e7017ca8ca.jpg',
  })
  backdropUrl?: string;
}
