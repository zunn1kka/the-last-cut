import { ApiProperty } from '@nestjs/swagger';
import { NotificationResponseDto } from './notification-response.dto';

export class NotificationsListResponseDto {
  @ApiProperty({
    description: 'Список уведомлений',
    type: [NotificationResponseDto],
  })
  items: NotificationResponseDto[];

  @ApiProperty({ description: 'Общее количество' })
  total: number;

  @ApiProperty({ description: 'Количество непрочитанных' })
  unreadCount: number;

  @ApiProperty({ description: 'Текущая страница' })
  page: number;

  @ApiProperty({ description: 'Всего страниц' })
  totalPages: number;
}
