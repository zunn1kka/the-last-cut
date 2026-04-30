import { ApiProperty } from '@nestjs/swagger';

export class UnreadCountResponseDto {
  @ApiProperty({ description: 'Количество непрочитанных уведомлений' })
  count: number;
}
