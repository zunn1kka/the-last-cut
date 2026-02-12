import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import { CreateContentDto } from 'src/content/dto/create-content.dto';

export class CreateSeriesDto extends CreateContentDto {
  @IsNumber()
  @Min(1)
  @Max(50)
  @ValidateIf((o) => o.contentType === 'SERIES')
  seasonsCount: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  episodesCount?: number;

  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  creatorIds?: string[];

  @IsString()
  @IsOptional()
  network?: string;
}
