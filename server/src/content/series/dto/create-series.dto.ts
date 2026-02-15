import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import { CreateContentDto } from 'src/content/dto/create-content.dto';

export class CreateSeriesDto extends CreateContentDto {
  @ApiProperty({
    description: 'Количество сезонов',
    example: 3,
    minimum: 1,
    maximum: 50,
  })
  @IsNumber({}, { message: 'Количество сезонов должно быть числом' })
  @Min(1, { message: 'Количество сезонов должно быть минимум 1' })
  @Max(50, { message: 'Количество сезонов не должно превышать 50' })
  @ValidateIf((o) => o.contentType === 'SERIES')
  seasonsCount: number;

  @ApiPropertyOptional({
    description: 'Общее количество эпизодов',
    example: 24,
    minimum: 0,
  })
  @IsNumber({}, { message: 'Количество эпизодов должно быть числом' })
  @Min(0, { message: 'Количество эпизодов не может быть отрицательным' })
  @IsOptional()
  episodesCount?: number;

  @ApiPropertyOptional({
    description: 'Завершен ли сериал',
    example: true,
  })
  @IsBoolean({ message: 'Флаг завершенности должен быть булевым значением' })
  @IsOptional()
  isCompleted?: boolean;
}
