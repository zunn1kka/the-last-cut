import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NotificationsService } from 'src/notifications/notifications.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findAllInMovie(contentId: string, page: number = 1) {
    const limit = 20;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.comment.findMany({
        where: { contentId, parentId: null }, // только корневые комментарии
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
          ratings: true,
          replies: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  avatarUrl: true,
                },
              },
              ratings: true,
            },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.comment.count({
        where: { contentId, parentId: null },
      }),
    ]);

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByUser(userId: string, page: number = 1) {
    console.log('🔍 [findByUser] Начало поиска для userId:', userId);
    console.log('🔍 [findByUser] Тип userId:', typeof userId);
    console.log('🔍 [findByUser] Длина userId:', userId?.length);

    // ДОБАВЬТЕ: Проверка существования пользователя
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, username: true },
    });
    console.log('👤 [findByUser] Пользователь найден:', user ? 'Да' : 'Нет');
    if (user) {
      console.log('👤 [findByUser] Email пользователя:', user.email);
    } else {
      console.log('❌ [findByUser] Пользователь с ID', userId, 'не найден!');
    }

    const limit = 20;
    const skip = (page - 1) * limit;

    // Проверяем, есть ли комментарии в БД вообще
    const allComments = await this.prisma.comment.findMany({
      take: 5,
      select: { id: true, userId: true, text: true },
    });
    console.log(
      '📊 [findByUser] Всего комментариев в БД (первые 5):',
      allComments,
    );

    // Проверяем, есть ли комментарии с этим userId
    const commentsByUser = await this.prisma.comment.findMany({
      where: { userId },
      select: { id: true, text: true, contentId: true },
    });
    console.log(
      '📊 [findByUser] Комментариев с userId:',
      commentsByUser.length,
    );

    if (commentsByUser.length > 0) {
      console.log('📊 [findByUser] Первый комментарий:', commentsByUser[0]);
    } else {
      console.log('⚠️ [findByUser] Нет комментариев для userId:', userId);
    }

    // Получаем полные данные с include
    const comments = await this.prisma.comment.findMany({
      where: { userId },
      include: {
        content: {
          select: {
            id: true,
            title: true,
            posterUrl: true,
            contentType: true,
          },
        },
        ratings: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    console.log(
      '📊 [findByUser] Возвращаем комментариев после include:',
      comments.length,
    );
    if (comments.length > 0) {
      console.log('📊 [findByUser] Первый в возвращаемом массиве:', {
        id: comments[0].id,
        text: comments[0].text,
        contentTitle: comments[0].content?.title,
      });
    }

    const total = await this.prisma.comment.count({ where: { userId } });

    return {
      items: comments,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findReplies(commentId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const parentComment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!parentComment) {
      throw new NotFoundException('Комментария не существует');
    }

    const comment = await this.prisma.comment.findMany({
      where: { parentId: commentId },
      include: {
        user: { select: { username: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'asc' },
      skip,
      take: limit,
    });

    return comment;
  }

  async create(userId: string, contentId: string, dto: CreateCommentDto) {
    const existingContent = await this.prisma.content.findUnique({
      where: { id: contentId },
    });
    if (!existingContent) {
      throw new NotFoundException('Контент не найден');
    }

    // Получаем информацию о пользователе для уведомления
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { username: true },
    });

    const comment = await this.prisma.comment.create({
      data: {
        text: dto.text,
        rating: dto.rating,
        userId: userId,
        contentId: contentId,
        parentId: dto.parentId || null,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        content: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // Если это ответ на комментарий, уведомляем автора родительского комментария
    if (dto.parentId) {
      const parentComment = await this.prisma.comment.findUnique({
        where: { id: dto.parentId },
        select: { userId: true, text: true },
      });

      if (parentComment && parentComment.userId !== userId) {
        await this.notificationsService.createNotification(
          parentComment.userId,
          {
            type: 'COMMENT_REPLY',
            title: 'Новый ответ на комментарий',
            message: `${user?.username || 'Пользователь'} ответил на ваш комментарий: "${comment.text.slice(0, 100)}${comment.text.length > 100 ? '...' : ''}"`,
            data: {
              commentId: comment.id,
              contentId: contentId,
              parentCommentId: dto.parentId,
            },
          },
        );
      }
    }

    return comment;
  }

  // Нужен ли update для комментариев, пока хз
  async update(userId: string, commentId: string, dto: UpdateCommentDto) {
    const existingComment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!existingComment) {
      throw new NotFoundException('Комментарий не найден');
    }
    if (existingComment.userId !== userId) {
      throw new ConflictException('Нет доступа к этому комментарию');
    }

    const updatedComment = await this.prisma.comment.update({
      where: { id: commentId },
      data: {
        text: dto.text,
        rating: dto.rating,
        userId: userId,
        contentId: dto.contentId,
      },
    });
    return updatedComment;
  }

  async delete(userId: string, commentId: string) {
    const existingComment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!existingComment) {
      throw new NotFoundException('Комментарий не найден');
    }
    if (existingComment.userId !== userId) {
      throw new ConflictException('Нет доступа к этому комментарию');
    }

    const deleteComment = await this.prisma.comment.delete({
      where: { id: commentId },
    });
    return deleteComment;
  }

  async reportComment(userId: string, commentId: string, reason: string) {
    // Проверяем, существует ли комментарий
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Комментарий не найден');
    }

    // Проверяем, не отправлял ли пользователь уже жалобу на этот комментарий
    const existingReportQuery = `
    SELECT * FROM comment_reports 
    WHERE comment_id = '${commentId}' AND user_id = '${userId}'
  `;

    const existingReport =
      await this.prisma.$queryRawUnsafe<any[]>(existingReportQuery);

    if (existingReport.length > 0) {
      throw new ConflictException(
        'Вы уже отправляли жалобу на этот комментарий',
      );
    }

    // Создаём жалобу прямым SQL запросом
    const insertQuery = `
    INSERT INTO comment_reports (id, comment_id, user_id, reason, status, created_at)
    VALUES (gen_random_uuid(), '${commentId}', '${userId}', '${reason}', 'pending', NOW())
  `;

    await this.prisma.$executeRawUnsafe(insertQuery);

    // Возвращаем созданную жалобу
    const selectQuery = `
    SELECT * FROM comment_reports 
    WHERE comment_id = '${commentId}' AND user_id = '${userId}'
    ORDER BY created_at DESC
    LIMIT 1
  `;

    const result = await this.prisma.$queryRawUnsafe<any[]>(selectQuery);

    return result[0];
  }
}
