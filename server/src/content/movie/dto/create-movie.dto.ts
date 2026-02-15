import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, Max, Min, ValidateIf } from 'class-validator';
import { CreateContentDto } from 'src/content/dto/create-content.dto';

export class CreateMovieDto extends CreateContentDto {
  @ApiProperty({
    description: 'Длительность фильма в минутах',
    example: 158,
    minimum: 1,
    maximum: 600,
  })
  @IsNumber({}, { message: 'Длительность должна быть числом' })
  @Min(1, { message: 'Длительность должна быть минимум 1 минута' })
  @Max(600, {
    message: 'Длительность не должна превышать 600 минут (10 часов)',
  })
  @ValidateIf((o) => o.contentType === 'MOVIE')
  duration: number;

  @ApiPropertyOptional({
    description: 'Бюджет фильма в долларах',
    example: 30000000,
    minimum: 0,
  })
  @IsNumber({}, { message: 'Бюджет должен быть числом' })
  @Min(0, { message: 'Бюджет не может быть отрицательным' })
  @IsOptional()
  budget?: number;
}
