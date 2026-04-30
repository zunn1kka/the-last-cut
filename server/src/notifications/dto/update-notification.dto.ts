import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationDto {
  @ApiPropertyOptional({ description: 'Прочитано ли уведомление' })
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;
}
