import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BookmarksService {
  constructor(private readonly prismaService: PrismaService) {}

  async findUserBookmarks(userId: string) {
    const bookmark = await this.prismaService.bookmark.findMany({
      where: { userId },
      include: {
        user: { select: { username: true } },
        content: {
          include: {
            movie: true,
            series: true,
            genres: { include: { genre: true } },
          },
        },
      },
    });

    return bookmark;
  }

  async addBookmark(userId: string, contentId: string) {
    const contentExists = await this.prismaService.content.findUnique({
      where: { id: contentId },
    });

    if (!contentExists) {
      throw new NotFoundException('Контент не найден');
    }

    const bookmark = await this.prismaService.bookmark.create({
      data: {
        userId,
        contentId,
      },
    });

    return bookmark;
  }

  async removeBookmark(userId: string, contentId: string) {
    const contentExists = await this.prismaService.content.findUnique({
      where: { id: contentId },
    });

    if (!contentExists) {
      throw new NotFoundException('Контент не найден');
    }

    const bookmarkContentExisting =
      await this.prismaService.bookmark.findUnique({
        where: { userId_contentId: { contentId, userId } },
      });

    if (!bookmarkContentExisting) {
      throw new NotFoundException('Такого контента в закладках нет');
    }

    const bookmark = await this.prismaService.bookmark.delete({
      where: { userId_contentId: { contentId, userId } },
    });

    return bookmark;
  }
}
