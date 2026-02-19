import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCommentRatingDto } from './dto/create-comment-rating.dto';
import { CreateContentRatingDto } from './dto/create-content-rating.dto';
import { UpdateCommentRatingDto } from './dto/update-comment-rating.dto';
import { UpdateContentRatingDto } from './dto/update-content-rating.dto';

@Injectable()
export class RatingsService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAllRatingsInContent(contentId: string) {
    return await this.prismaService.contentRating.findMany({
      where: { contentId },
      include: {
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
    });
  }

  async findAllUserRatingsInContents(userId: string) {
    return await this.prismaService.contentRating.findMany({
      where: { userId },
      include: {
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
    });
  }

  async rateContent(
    userId: string,
    contentId: string,
    dto: CreateContentRatingDto,
  ) {
    await this.checkContentExists(contentId);

    const rate = await this.prismaService.contentRating.create({
      data: {
        userId,
        contentId,
        rating: dto.rating,
      },
    });

    return rate;
  }

  async updateRateContent(
    userId: string,
    contentId: string,
    dto: UpdateContentRatingDto,
  ) {
    await this.checkContentExists(contentId);

    const rate = await this.prismaService.contentRating.update({
      where: { userId_contentId: { userId, contentId } },
      data: {
        userId,
        contentId,
        rating: dto.rating,
      },
    });

    return rate;
  }

  async removeRateContent(userId: string, contentId: string) {
    await this.checkContentExists(contentId);

    const rate = await this.prismaService.contentRating.delete({
      where: { userId_contentId: { userId, contentId } },
    });

    return rate;
  }

  async findAllRatingsInComment(commentId: string) {
    return await this.prismaService.commentRating.findMany({
      where: { commentId },
      include: {
        comment: {
          select: {
            text: true,
            rating: true,
          },
          include: { content: { select: { title: true, contentType: true } } },
        },
      },
    });
  }

  async findAllUserCommentRatingsInContents(userId: string) {
    return await this.prismaService.commentRating.findMany({
      where: { userId },
      include: {
        comment: {
          select: {
            text: true,
            ratings: true,
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

    const rate = await this.prismaService.commentRating.create({
      data: {
        userId,
        commentId,
        isPositive: dto.isPositive,
      },
    });

    return rate;
  }

  async updateRateComment(
    userId: string,
    commentId: string,
    dto: UpdateCommentRatingDto,
  ) {
    await this.checkCommentExists(commentId);

    const rate = await this.prismaService.commentRating.update({
      where: { userId_commentId: { userId, commentId } },
      data: {
        userId,
        commentId,
        isPositive: dto.isPositive,
      },
    });

    return rate;
  }

  async removeRateComment(userId: string, commentId: string) {
    await this.checkCommentExists(commentId);

    const rate = await this.prismaService.commentRating.delete({
      where: { userId_commentId: { userId, commentId } },
    });

    return rate;
  }

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
