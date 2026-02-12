import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllInMovie(
    contentId: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;
    const [comments, total] = await Promise.all([
      this.prisma.comment.findMany({
        where: { contentId, parent: null },
        include: {
          user: {
            select: { username: true, avatarUrl: true },
          },
          replies: {
            include: { user: { select: { username: true, avatarUrl: true } } },
            orderBy: { createdAt: 'asc' },
            take: 5,
          },
          _count: { select: { replies: true, ratings: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.comment.count({ where: { contentId, parent: null } }),
    ]);

    return {
      comments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
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
    const existingMovie = await this.prisma.content.findUnique({
      where: { id: contentId },
    });
    if (!existingMovie) {
      throw new NotFoundException('Фильм не найден');
    }

    if (dto.parentId) {
      const parentComment = await this.prisma.comment.findUnique({
        where: { id: dto.parentId },
      });

      if (!parentComment) {
        throw new NotFoundException('Родительский комментарий не найден');
      }

      if (parentComment.contentId !== contentId) {
        throw new ConflictException(
          'Родительский комментарий не относится к этому фильму',
        );
      }
    }

    const comment = await this.prisma.comment.create({
      data: {
        text: dto.text,
        rating: dto.rating,
        userId: userId,
        contentId: contentId,
        parentId: dto.parentId || null,
      },
    });

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
}
