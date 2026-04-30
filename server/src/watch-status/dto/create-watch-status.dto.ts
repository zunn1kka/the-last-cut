import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { WatchStatus } from 'generated/prisma/enums';

export class CreateWatchStatusDto {
  @ApiProperty({ enum: WatchStatus, description: 'Статус просмотра' })
  @IsString()
  status: string;

  @ApiPropertyOptional({
    description: 'Прогресс просмотра (в минутах или процентах)',
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  progress?: number;
}
