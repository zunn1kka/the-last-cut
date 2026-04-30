import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NotificationsService } from 'src/notifications/notifications.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCommentRatingDto } from './dto/create-comment-rating.dto';
import { CreateContentRatingDto } from './dto/create-content-rating.dto';
import { UpdateCommentRatingDto } from './dto/update-comment-rating.dto';
import { UpdateContentRatingDto } from './dto/update-content-rating.dto';

@Injectable()
export class RatingsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // ========== РЕЙТИНГИ КОНТЕНТА ==========

  async findAllRatingsInContent(contentId: string) {
    return await this.prismaService.contentRating.findMany({
      where: { contentId },
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
            title: true,
            imdbRating: true,
            kinopoiskRating: true,
            siteRating: true,
            contentType: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllUserRatingsInContents(userId: string) {
    return await this.prismaService.contentRating.findMany({
      where: { userId },
      include: {
        content: {
          select: {
            id: true,
            title: true,
            posterUrl: true,
            releaseYear: true,
            contentType: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  // ✅ НОВЫЙ МЕТОД
  async findUserContentRating(userId: string, contentId: string) {
    const rating = await this.prismaService.contentRating.findUnique({
      where: {
        userId_contentId: {
          userId,
          contentId,
        },
      },
      select: {
        rating: true,
      },
    });

    return { rating: rating?.rating || null };
  }

  async getContentRatingStats(contentId: string) {
    const stats = await this.prismaService.contentRating.aggregate({
      where: { contentId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    return {
      averageRating: stats._avg.rating || 0,
      totalRatings: stats._count.rating || 0,
    };
  }

  // После того как пользователь поставил оценку
  async rateContent(
    userId: string,
    contentId: string,
    dto: CreateContentRatingDto,
  ) {
    await this.checkContentExists(contentId);

    const rating = await this.prismaService.contentRating.upsert({
      where: { userId_contentId: { userId, contentId } },
      update: { rating: dto.rating, updatedAt: new Date() },
      create: { userId, contentId, rating: dto.rating },
    });

    // Пересчитываем средний рейтинг
    const stats = await this.prismaService.contentRating.aggregate({
      where: { contentId },
      _avg: { rating: true },
    });

    const averageRating = stats._avg.rating
      ? Number(stats._avg.rating.toFixed(1))
      : null;

    // Обновляем siteRating в таблице content
    await this.prismaService.content.update({
      where: { id: contentId },
      data: { siteRating: averageRating },
    });

    return rating;
  }

  async updateRateContent(
    userId: string,
    contentId: string,
    dto: UpdateContentRatingDto,
  ) {
    return this.rateContent(userId, contentId, dto as CreateContentRatingDto);
  }

  async removeRateContent(userId: string, contentId: string) {
    try {
      const rate = await this.prismaService.contentRating.delete({
        where: { userId_contentId: { userId, contentId } },
      });

      return rate;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Оценка не найдена');
      }
      throw error;
    }
  }

  // ========== РЕЙТИНГИ КОММЕНТАРИЕВ ==========

  async findAllRatingsInComment(commentId: string) {
    const ratings = await this.prismaService.commentRating.findMany({
      where: { commentId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        comment: {
          select: {
            text: true,
            rating: true,
            content: {
              select: {
                title: true,
                contentType: true,
              },
            },
          },
        },
      },
    });

    const likes = ratings.filter((r) => r.isPositive).length;
    const dislikes = ratings.filter((r) => !r.isPositive).length;

    return {
      ratings,
      likes,
      dislikes,
      total: ratings.length,
    };
  }

  async findAllUserCommentRatingsInContents(userId: string) {
    return await this.prismaService.commentRating.findMany({
      where: { userId },
      include: {
        comment: {
          select: {
            id: true,
            text: true,
            rating: true,
            content: {
              select: {
                title: true,
              },
            },
          },
        },
        user: { select: { username: true, avatarUrl: true } },
      },
    });
  }

  async rateComment(
    userId: string,
    commentId: string,
    dto: CreateCommentRatingDto,
  ) {
    await this.checkCommentExists(commentId);

    // Получаем информацию о комментарии и авторе
    const comment = await this.prismaService.comment.findUnique({
      where: { id: commentId },
      select: {
        userId: true,
        text: true,
        user: {
          select: { username: true },
        },
      },
    });

    if (!comment) {
      throw new NotFoundException('Комментарий не найден');
    }

    // Получаем информацию о пользователе, который ставит оценку
    const ratingUser = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: { username: true },
    });

    try {
      const rate = await this.prismaService.commentRating.upsert({
        where: { userId_commentId: { userId, commentId } },
        update: { isPositive: dto.isPositive },
        create: {
          userId,
          commentId,
          isPositive: dto.isPositive,
        },
      });

      // Создаём уведомление для автора комментария (если оценка не от самого автора)
      if (comment.userId !== userId) {
        const action = dto.isPositive ? 'лайк' : 'дизлайк';
        await this.notificationsService.createNotification(comment.userId, {
          type: 'COMMENT_LIKE',
          title: dto.isPositive
            ? 'Лайк на комментарий'
            : 'Дизлайк на комментарий',
          message: `${ratingUser?.username || 'Пользователь'} поставил ${action} на ваш комментарий: "${comment.text.slice(0, 100)}${comment.text.length > 100 ? '...' : ''}"`,
          data: {
            commentId,
            isPositive: dto.isPositive,
            userId: userId,
          },
        });
      }

      return rate;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Вы уже оценили этот комментарий');
      }
      throw error;
    }
  }

  async updateRateComment(
    userId: string,
    commentId: string,
    dto: UpdateCommentRatingDto,
  ) {
    return this.rateComment(userId, commentId, dto as CreateCommentRatingDto);
  }

  async removeRateComment(userId: string, commentId: string) {
    try {
      const rate = await this.prismaService.commentRating.delete({
        where: { userId_commentId: { userId, commentId } },
      });

      return rate;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Оценка комментария не найдена');
      }
      throw error;
    }
  }

  // ========== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ==========

  private async checkContentExists(contentId: string) {
    const content = await this.prismaService.content.findUnique({
      where: { id: contentId },
      select: { id: true },
    });

    if (!content) {
      throw new NotFoundException('Контент не найден');
    }

    return content;
  }

  private async checkCommentExists(commentId: string) {
    const comment = await this.prismaService.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Комментарий не найден');
    }

    return comment;
  }
}
