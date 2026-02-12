import { Injectable, NotFoundException } from '@nestjs/common';
import { FileService } from 'src/file/file.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { MovieService } from './movie/movie.service';
import { SeriesService } from './series/series.service';

@Injectable()
export class ContentService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly movieService: MovieService,
    private readonly seriesService: SeriesService,
    private readonly fileService: FileService,
  ) {}

  async findAll() {
    return await this.prismaService.content.findMany({
      include: {
        movie: true,
        series: true,
        persons: {
          include: { person: true, role: true },
        },
        genres: { include: { genre: true } },
      },
    });
  }
  async findOne(contentId: string) {
    const content = await this.prismaService.content.findUnique({
      where: { id: contentId },
    });
    if (!content) {
      throw new NotFoundException('Такого фильма или сериала нет');
    }
    return content;
  }

  async delete(contentId: string) {
    const content = await this.prismaService.content.findUnique({
      where: { id: contentId },
    });
    if (!content) {
      throw new NotFoundException('Такого фильма или сериала нет');
    }

    return await this.prismaService.content.delete({
      where: { id: contentId },
    });
  }
}
