import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly prismaService: PrismaService) {}

  async createNotification(userId: string, dto: CreateNotificationDto) {
    return this.prismaService.notification.create({
      data: {
        userId,
        type: dto.type as any,
        title: dto.title,
        message: dto.message,
        data: dto.data || {},
      },
    });
  }

  async getUserNotifications(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prismaService.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prismaService.notification.count({ where: { userId } }),
    ]);

    const unreadCount = await this.prismaService.notification.count({
      where: { userId, isRead: false },
    });

    return {
      items,
      total,
      unreadCount,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async markAsRead(userId: string, notificationId: string) {
    // Проверяем существование
    const notification = await this.prismaService.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException('Уведомление не найдено');
    }

    return this.prismaService.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    // Обновляем только существующие непрочитанные уведомления
    const result = await this.prismaService.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    // Если ничего не обновлено - это не ошибка
    if (result.count === 0) {
      return { message: 'Нет непрочитанных уведомлений', count: 0 };
    }

    return {
      message: 'Все уведомления отмечены как прочитанные',
      count: result.count,
    };
  }

  async updateNotification(
    userId: string,
    notificationId: string,
    dto: UpdateNotificationDto,
  ) {
    // Сначала проверяем, существует ли уведомление и принадлежит ли пользователю
    const notification = await this.prismaService.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException('Уведомление не найдено');
    }

    return this.prismaService.notification.update({
      where: { id: notificationId },
      data: {
        isRead: dto.isRead,
      },
    });
  }

  async getUnreadCount(userId: string) {
    const count = await this.prismaService.notification.count({
      where: { userId, isRead: false },
    });
    return { count };
  }

  async getNotificationById(userId: string, notificationId: string) {
    return this.prismaService.notification.findFirst({
      where: { id: notificationId, userId },
    });
  }

  async deleteNotification(userId: string, notificationId: string) {
    // Проверяем существование
    const notification = await this.prismaService.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException('Уведомление не найдено');
    }

    return await this.prismaService.notification.delete({
      where: { id: notificationId },
    });
  }

  async deleteAllNotifications(userId: string) {
    return await this.prismaService.notification.deleteMany({
      where: { userId },
    });
  }
}
