import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Authorization } from 'src/auth/decorators/authorization.decorator';
import { Authorized } from 'src/auth/decorators/authorized.decorator';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@ApiBearerAuth('JWT-auth')
@Controller('notifications')
@Authorization()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @ApiOperation({
    summary: 'Создать уведомление (для внутреннего использования)',
  })
  async create(
    @Authorized('id') userId: string,
    @Body() dto: CreateNotificationDto,
  ) {
    return this.notificationsService.createNotification(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить уведомления пользователя' })
  async findAll(
    @Authorized('id') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    return this.notificationsService.getUserNotifications(
      userId,
      pageNum,
      limitNum,
    );
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Получить количество непрочитанных уведомлений' })
  async getUnreadCount(@Authorized('id') userId: string) {
    return this.notificationsService.getUnreadCount(userId);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Отметить все уведомления как прочитанные' })
  async markAllAsRead(@Authorized('id') userId: string) {
    console.log('📥 markAllAsRead вызван');
    return this.notificationsService.markAllAsRead(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить уведомление по ID' })
  async findOne(
    @Authorized('id') userId: string,
    @Param('id') notificationId: string,
  ) {
    return this.notificationsService.getNotificationById(
      userId,
      notificationId,
    );
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Отметить уведомление как прочитанное' })
  async markAsRead(
    @Authorized('id') userId: string,
    @Param('id') notificationId: string,
  ) {
    return this.notificationsService.markAsRead(userId, notificationId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить уведомление' })
  async update(
    @Authorized('id') userId: string,
    @Param('id') notificationId: string,
    @Body() dto: UpdateNotificationDto,
  ) {
    return this.notificationsService.updateNotification(
      userId,
      notificationId,
      dto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить уведомление' })
  async delete(
    @Authorized('id') userId: string,
    @Param('id') notificationId: string,
  ) {
    return this.notificationsService.deleteNotification(userId, notificationId);
  }

  @Delete()
  @ApiOperation({ summary: 'Удалить все уведомления пользователя' })
  async deleteAll(@Authorized('id') userId: string) {
    return this.notificationsService.deleteAllNotifications(userId);
  }
}
