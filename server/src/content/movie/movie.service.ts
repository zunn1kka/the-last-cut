import { Injectable, NotFoundException } from '@nestjs/common';
import { ContentType } from 'generated/prisma/enums';
import { FileService } from 'src/file/file.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MovieService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly fileService: FileService,
  ) {}

  async findAll() {
    const movies = await this.prismaService.content.findMany({
      where: { contentType: ContentType.MOVIE },
      include: {
        movie: true,
      },
    });

    return movies.map((movie) => {
      if (movie.movie?.budget) {
        (movie.movie as any).budget = Number(movie.movie.budget);
      }
      return movie;
    });
  }

  async findOne(movieId: string) {
    const movie = await this.prismaService.content.findUnique({
      where: {
        id: movieId,
        contentType: ContentType.MOVIE,
      },
      include: {
        movie: true,
        genres: {
          include: { genre: true },
        },
        persons: {
          include: {
            person: true,
            role: true,
          },
        },
      },
    });

    if (!movie) {
      throw new NotFoundException('Фильм не найден');
    }
    if (movie.movie?.budget) {
      (movie.movie as any).budget = Number(movie.movie.budget);
    }

    return movie;
  }
}
