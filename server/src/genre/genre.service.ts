import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class GenreService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll() {
    return this.prismaService.genre.findMany({});
  }

  async findOne(genreId: string) {
    return this.prismaService.genre.findUnique({
      where: { id: genreId },
    });
  }

  async search(query: string): Promise<any[]> {
    if (!query || query.trim() === '') {
      return [];
    }

    return await this.prismaService.genre.findMany({
      where: {
        name: {
          contains: query,
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
      take: 10,
    });
  }
}
