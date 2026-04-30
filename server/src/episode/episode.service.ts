import { Injectable, NotFoundException } from '@nestjs/common';
import { ContentType } from 'generated/prisma/enums';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class EpisodeService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(seriesId?: string) {
    const where = seriesId ? { seriesId } : {};

    return this.prismaService.episode.findMany({
      where,
      orderBy: [{ seasonNumber: 'asc' }, { episodeNumber: 'asc' }],
      include: {
        series: {
          include: { content: true },
        },
      },
    });
  }

  async findBySeries(contentId: string) {
    // 1. Находим контент с типом SERIES
    const content = await this.prismaService.content.findUnique({
      where: { id: contentId, contentType: ContentType.SERIES },
      include: { series: true },
    });

    if (!content || !content.series) {
      throw new NotFoundException('Сериал не найден');
    }

    // 2. Получаем внутренний ID сериала
    const seriesId = content.series.id;

    // 3. Возвращаем эпизоды
    return this.prismaService.episode.findMany({
      where: { seriesId },
      orderBy: [{ seasonNumber: 'asc' }, { episodeNumber: 'asc' }],
      include: {
        series: {
          include: { content: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const episode = await this.prismaService.episode.findUnique({
      where: { id },
      include: {
        series: {
          include: { content: true },
        },
      },
    });

    if (!episode) {
      throw new NotFoundException('Эпизод не найден');
    }

    return episode;
  }
}
