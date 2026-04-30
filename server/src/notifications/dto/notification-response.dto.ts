import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class NotificationResponseDto {
  @ApiProperty({ description: 'ID уведомления' })
  id: string;

  @ApiProperty({ description: 'ID пользователя' })
  userId: string;

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
  type: string;

  @ApiProperty({ description: 'Заголовок' })
  title: string;

  @ApiPropertyOptional({ description: 'Сообщение' })
  message?: string;

  @ApiPropertyOptional({ description: 'Дополнительные данные' })
  data?: any;

  @ApiProperty({ description: 'Прочитано ли' })
  isRead: boolean;

  @ApiProperty({ description: 'Дата создания' })
  createdAt: Date;
}
