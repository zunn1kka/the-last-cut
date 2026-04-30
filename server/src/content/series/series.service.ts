import { Injectable, NotFoundException } from '@nestjs/common';
import { ContentType } from 'generated/prisma/enums';
import { FileService } from 'src/file/file.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SeriesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly fileService: FileService,
  ) {}
  async findAll() {
    return await this.prismaService.content.findMany({
      where: { contentType: ContentType.SERIES },
      include: {
        series: true,
        genres: { include: { genre: true } },
        persons: { include: { person: true, role: true } },
      },
    });
  }

  async findOne(id: string) {
    const series = await this.prismaService.content.findUnique({
      where: { id, contentType: ContentType.SERIES },
      include: {
        series: {
          include: {
            episodes: {
              orderBy: [{ seasonNumber: 'asc' }, { episodeNumber: 'asc' }],
            },
          },
        },
        genres: { include: { genre: true } },
        persons: { include: { person: true, role: true } },
      },
    });

    console.log('📊 Найденный сериал:', series?.title);
    console.log(
      '📊 Количество эпизодов:',
      series?.series?.episodes?.length || 0,
    );
    console.log(
      '📊 Эпизоды:',
      JSON.stringify(series?.series?.episodes, null, 2),
    );

    if (!series) throw new NotFoundException('Сериал не найден');
    return series;
  }
}
