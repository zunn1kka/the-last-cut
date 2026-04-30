import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsJSON, IsOptional, IsString } from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty({
    description: 'Тип уведомления',
    enum: [
      'COMMENT_REPLY',
      'COMMENT_LIKE',
      'FRIEND_REQUEST',
      'FRIEND_ACCEPTED',
      'MOVIE_UPDATE',
      'SYSTEM',
    ],
  })
  @IsString()
  type: string;

  @ApiProperty({ description: 'Заголовок уведомления' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Текст уведомления' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({ description: 'Дополнительные данные' })
  @IsOptional()
  @IsJSON()
  data?: any;
}
