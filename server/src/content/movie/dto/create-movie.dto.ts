import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import { CreateContentDto } from 'src/content/dto/create-content.dto';

export class CreateMovieDto extends CreateContentDto {
  @IsNumber()
  @Min(1)
  @Max(600)
  @ValidateIf((o) => o.contentType === 'MOVIE')
  duration: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  budget?: number;

  @IsString()
  @IsOptional()
  directorId?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  writerIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  actorIds?: string[];
}
