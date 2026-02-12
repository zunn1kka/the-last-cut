import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ContentType } from 'generated/prisma/enums';
import { FileService } from 'src/file/file.service';
import { FileType } from 'src/lib/common/enums/type-file.enum';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

@Injectable()
export class MovieService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly fileService: FileService,
  ) {}

  async create(dto: CreateMovieDto, userId: string) {
    const existingMovie = await this.prismaService.content.findFirst({
      where: {
        OR: [{ title: dto.title }, { originalTitle: dto.originalTitle }],
      },
    });

    if (existingMovie) {
      throw new ConflictException('Такой фильм уже есть');
    }

    return this.prismaService.$transaction(async (tx) => {
      const content = await tx.content.create({
        data: {
          title: dto.title || '',
          originalTitle: dto.originalTitle,
          description: dto.description || '',
          releaseYear: dto.releaseYear,
          posterUrl: '',
          backdropUrl: null,
          imdbRating: dto.imdbRating,
          kinopoiskRating: dto.kinopoiskRating,
          ageRating: dto.ageRating,
          contentType: ContentType.MOVIE,
        },
      });

      await tx.movie.create({
        data: {
          contentId: content.id,
          duration: dto.duration,
          budget: dto.budget,
        },
      });

      if (dto.genreIds?.length) {
        await this.addGenresToContent(content.id, dto.genreIds, tx);
      }

      if (dto.persons?.length) {
        await this.addPersonsToContent(content.id, dto.persons, tx);
      }

      return this.getMovieWithDetails(content.id);
    });
  }

  async update(contentId: string, dto: UpdateMovieDto, userId: string) {
    const existingMovie = await this.prismaService.content.findFirst({
      where: {
        OR: [{ title: dto.title }, { originalTitle: dto.originalTitle }],
      },
    });

    if (existingMovie) {
      throw new ConflictException('Такой фильм уже есть');
    }

    return this.prismaService.$transaction(async (tx) => {
      const content = await tx.content.findUnique({
        where: { id: contentId, contentType: ContentType.MOVIE },
        include: { movie: true },
      });

      if (!content || !content.movie) {
        throw new NotFoundException('Фильм не найден');
      }

      await tx.content.update({
        where: { id: contentId },
        data: {
          title: dto.title,
          originalTitle: dto.originalTitle,
          description: dto.description,
          releaseYear: dto.releaseYear,
          posterUrl: '',
          backdropUrl: null,
          imdbRating: dto.imdbRating,
          kinopoiskRating: dto.kinopoiskRating,
          ageRating: dto.ageRating,
        },
      });

      await tx.movie.update({
        where: { contentId },
        data: {
          duration: dto.duration,
          budget: dto.budget,
        },
      });

      if (dto.genreIds) {
        await tx.contentGenre.deleteMany({
          where: { contentId },
        });
        if (dto.genreIds.length > 0) {
          await this.addGenresToContent(contentId, dto.genreIds, tx);
        }
      }

      if (dto.persons) {
        await tx.contentPerson.deleteMany({
          where: { contentId },
        });
        if (dto.persons.length > 0) {
          await this.addPersonsToContent(contentId, dto.persons, tx);
        }
      }

      return this.getMovieWithDetails(contentId);
    });
  }

  async delete(contentId: string, userId: string) {
    const content = await this.prismaService.content.findUnique({
      where: { id: contentId, contentType: ContentType.MOVIE },
    });

    if (!content) {
      throw new NotFoundException('Фильм не найден');
    }

    if (content.posterUrl) {
      await this.fileService.deleteFile(content.posterUrl);
    }
    if (content.backdropUrl) {
      await this.fileService.deleteFile(content.backdropUrl);
    }

    await this.prismaService.content.delete({
      where: { id: contentId },
    });

    return { success: true, message: 'Movie deleted successfully' };
  }

  async uploadPoster(
    contentId: string,
    posterFile: Express.Multer.File,
    userId: string,
  ) {
    const content = await this.prismaService.content.findUnique({
      where: {
        id: contentId,
        contentType: ContentType.MOVIE,
      },
    });

    if (!content) {
      throw new NotFoundException('Фильм не найден');
    }

    const poster = await this.fileService.saveFile(posterFile, FileType.POSTER);

    if (content.posterUrl) {
      await this.fileService.deleteFile(content.posterUrl);
    }

    return this.prismaService.content.update({
      where: { id: contentId },
      data: { posterUrl: poster.url },
      include: {
        movie: true,
        genres: { include: { genre: true } },
        persons: {
          include: {
            person: true,
            role: true,
          },
        },
      },
    });
  }

  async uploadBackdrop(
    contentId: string,
    backdropFile: Express.Multer.File,
    userId: string,
  ) {
    const content = await this.prismaService.content.findUnique({
      where: {
        id: contentId,
        contentType: ContentType.MOVIE,
      },
    });

    if (!content) {
      throw new NotFoundException('Фильм не найден');
    }

    const backdrop = await this.fileService.saveFile(
      backdropFile,
      FileType.BACKDROP,
    );

    if (content.backdropUrl) {
      await this.fileService.deleteFile(content.backdropUrl);
    }

    return this.prismaService.content.update({
      where: { id: contentId },
      data: { backdropUrl: backdrop.url },
      include: {
        movie: true,
        genres: { include: { genre: true } },
        persons: {
          include: {
            person: true,
            role: true,
          },
        },
      },
    });
  }

  async uploadImages(
    contentId: string,
    userId: string,
    posterFile?: Express.Multer.File,
    backdropFile?: Express.Multer.File,
  ) {
    return this.prismaService.$transaction(async (tx) => {
      const content = await tx.content.findUnique({
        where: {
          id: contentId,
          contentType: ContentType.MOVIE,
        },
      });

      if (!content) {
        throw new NotFoundException('Фильм не найден');
      }

      let posterUrl = content.posterUrl;
      let backdropUrl = content.backdropUrl;

      if (posterFile) {
        if (posterUrl) {
          await this.fileService.deleteFile(posterUrl);
        }
        const poster = await this.fileService.saveFile(
          posterFile,
          FileType.POSTER,
        );
        posterUrl = poster.url;
      }

      if (backdropFile) {
        if (backdropUrl) {
          await this.fileService.deleteFile(backdropUrl);
        }
        const backdrop = await this.fileService.saveFile(
          backdropFile,
          FileType.BACKDROP,
        );
        backdropUrl = backdrop.url;
      }

      return tx.content.update({
        where: { id: contentId },
        data: {
          posterUrl,
          backdropUrl,
        },
        include: {
          movie: true,
          genres: { include: { genre: true } },
          persons: {
            include: {
              person: true,
              role: true,
            },
          },
        },
      });
    });
  }

  private async getMovieWithDetails(contentId: string) {
    return await this.prismaService.content.findUnique({
      where: { id: contentId },
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
  }

  private async addGenresToContent(
    contentId: string,
    genresIds: string[],
    tx: any,
  ) {
    const genrePromises = genresIds.map((genreId) =>
      tx.contentGenre.create({
        data: {
          contentId,
          genreId,
        },
      }),
    );
    await Promise.all(genrePromises);
  }

  private async addPersonsToContent(
    contentId: string,
    persons: any[],
    tx: any,
  ) {
    const personPromises = persons.map((person) =>
      tx.contentPerson.create({
        data: {
          contentId,
          personId: person.personId,
          roleId: person.roleId,
          roleName: person.roleName,
          importance: person.importance || 5,
        },
      }),
    );
    await Promise.all(personPromises);
  }

  // private groupPersonsByRole(persons: any[]) {
  //   const grouped: Record<string, any[]> = {};

  //   persons.forEach((cp) => {
  //     const roleName = cp.role?.name || 'Other';
  //     if (!grouped[roleName]) {
  //       grouped[roleName] = [];
  //     }

  //     grouped[roleName].push({
  //       id: cp.person.id,
  //       fullname: cp.person.fullname,
  //       photoUrl: cp.person.photoUrl,
  //       roleName: cp.roleName || cp.role?.name,
  //       importance: cp.importance,
  //     });
  //   });

  //   Object.keys(grouped).forEach((role) => {
  //     grouped[role].sort((a, b) => b.importance - a.importance);
  //   });

  //   return grouped;
  // }
}
