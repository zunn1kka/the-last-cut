import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ContentType } from 'generated/prisma/enums';
import { CreateMovieDto } from 'src/content/movie/dto/create-movie.dto';
import { UpdateMovieDto } from 'src/content/movie/dto/update-movie.dto';
import { CreateSeriesDto } from 'src/content/series/dto/create-series.dto';
import { UpdateSeriesDto } from 'src/content/series/dto/update-series.dto';
import { FileService } from 'src/file/file.service';
import { CreateGenreDto } from 'src/genre/dto/create-genre.dto';
import { UpdateGenreDto } from 'src/genre/dto/update-genre.dto';
import { FileType } from 'src/lib/common/enums/type-file.enum';
import { CreatePersonRoleDto } from 'src/person-role/dto/create-person-role.dto';
import { UpdatePersonRoleDto } from 'src/person-role/dto/update-person-role.dto';
import { CreatePersonDto } from 'src/person/dto/create-person.dto';
import { UpdatePersonDto } from 'src/person/dto/update-person.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly fileService: FileService,
  ) {}
  private readonly infoPerson = {
    id: true,
    fullname: true,
    photoUrl: true,
    biography: true,
    birthDate: true,
    deathDate: true,
  };

  async createMovie(dto: CreateMovieDto, userId: string) {
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

  async updateMovie(contentId: string, dto: UpdateMovieDto, userId: string) {
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

  async deleteMovie(contentId: string, userId: string) {
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

  async createSeries(dto: CreateSeriesDto, userId: string) {
    const existingSeries = await this.prismaService.content.findFirst({
      where: {
        OR: [{ title: dto.title }, { originalTitle: dto.originalTitle }],
      },
    });

    if (existingSeries) {
      throw new ConflictException('Такой сериал уже есть');
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
          contentType: ContentType.SERIES,
        },
      });

      await tx.series.create({
        data: {
          contentId: content.id,
          seasonsCount: dto.seasonsCount || 1,
          episodesCount: dto.episodesCount,
        },
      });

      if (dto.genreIds?.length) {
        await this.addGenresToContent(content.id, dto.genreIds, tx);
      }

      if (dto.persons?.length) {
        await this.addPersonsToContent(content.id, dto.persons, tx);
      }

      return this.getSeriesWithDetails(content.id);
    });
  }

  async updateSeries(contentId: string, dto: UpdateSeriesDto, userId: string) {
    return this.prismaService.$transaction(async (tx) => {
      const content = await tx.content.findUnique({
        where: { id: contentId, contentType: ContentType.SERIES },
        include: { series: true },
      });

      if (!content || !content.series) {
        throw new NotFoundException('Сериал не найден');
      }

      await tx.content.update({
        where: { id: contentId },
        data: {
          title: dto.title,
          originalTitle: dto.originalTitle,
          description: dto.description,
          releaseYear: dto.releaseYear,
          imdbRating: dto.imdbRating,
          kinopoiskRating: dto.kinopoiskRating,
          ageRating: dto.ageRating,
        },
      });

      await tx.series.update({
        where: { contentId },
        data: {
          seasonsCount: dto.seasonsCount || 1,
          episodesCount: dto.episodesCount,
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

      return this.getSeriesWithDetails(contentId);
    });
  }

  async deleteSeries(contentId: string, userId: string) {
    const content = await this.prismaService.content.findUnique({
      where: { id: contentId, contentType: ContentType.SERIES },
    });

    if (!content) {
      throw new NotFoundException('Сериал не найден');
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

    return { success: true, message: 'Series deleted successfully' };
  }

  async uploadPoster(
    contentId: string,
    posterFile: Express.Multer.File,
    userId: string,
  ) {
    const content = await this.prismaService.content.findUnique({
      where: {
        id: contentId,
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
        series: true,
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
        series: true,
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
        },
      });

      if (!content) {
        throw new NotFoundException('Контент не найден');
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
          series: true,
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

  async deleteContent(contentId: string) {
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

  async createGenre(userId: string, dto: CreateGenreDto) {
    const existingGenre = await this.prismaService.genre.findFirst({
      where: { name: dto.name, slug: dto.slug },
    });

    if (existingGenre) {
      throw new ConflictException('Жанр с таким именем или slug уже есть');
    }

    const genre = await this.prismaService.genre.create({
      data: {
        name: dto.name,
        slug: dto.slug,
      },
    });

    return genre;
  }

  async updateGenre(userId: string, genreId: string, dto: UpdateGenreDto) {
    const existingGenre = await this.prismaService.genre.findUnique({
      where: { id: genreId },
    });

    if (!existingGenre) {
      throw new NotFoundException('Жанра не существует');
    }

    const genre = await this.prismaService.genre.update({
      where: { id: genreId },
      data: {
        name: dto.name,
        slug: dto.slug,
      },
    });

    return genre;
  }

  async deleteGenre(userId: string, genreId: string) {
    const existingGenre = await this.prismaService.genre.findUnique({
      where: { id: genreId },
    });

    if (!existingGenre) {
      throw new NotFoundException('Фанра не существует');
    }

    const genre = await this.prismaService.genre.delete({
      where: { id: genreId },
    });

    return genre;
  }

  async createPerson(
    userId: string,
    dto: CreatePersonDto,
    personPhoto: Express.Multer.File,
  ) {
    let photoUrl: string | null = null;

    if (personPhoto) {
      const person = await this.fileService.saveFile(
        personPhoto,
        FileType.PERSON_PHOTO,
      );

      photoUrl = person.url;
    }

    const existingPerson = await this.prismaService.person.findFirst({
      where: {
        fullname: dto.fullname,
        photoUrl,
        birthDate: dto.birthDate,
        deathDate: dto.deathDate,
      },
    });

    if (existingPerson) {
      throw new ConflictException('Такой человек уже существует');
    }

    const person = await this.prismaService.person.create({
      data: {
        fullname: dto.fullname,
        photoUrl,
        biography: dto.biography,
        birthDate: dto.birthDate,
        deathDate: dto.deathDate,
      },
      select: this.infoPerson,
    });

    return person;
  }

  async updatePerson(
    userId: string,
    personId: string,
    dto: UpdatePersonDto,
    personPhoto: Express.Multer.File,
  ) {
    const personAvatar = await this.prismaService.person.findUnique({
      where: { id: personId },
    });
    let photoUrl: string | null = null;

    if (personPhoto) {
      if (personAvatar.photoUrl) {
        await this.fileService.deleteFile(personAvatar.photoUrl);
      }
      const person = await this.fileService.saveFile(
        personPhoto,
        FileType.PERSON_PHOTO,
      );

      photoUrl = person.url;
    }

    const existingPerson = await this.prismaService.person.findUnique({
      where: { id: personId },
    });

    if (!existingPerson) {
      throw new NotFoundException('Такого человека не существует');
    }

    const person = await this.prismaService.person.update({
      where: { id: personId },
      data: {
        fullname: dto.fullname,
        photoUrl,
        biography: dto.biography,
        birthDate: dto.birthDate,
        deathDate: dto.deathDate,
      },
      select: this.infoPerson,
    });

    return person;
  }

  async deletePerson(userId: string, personId: string) {
    const existingPerson = await this.prismaService.person.findUnique({
      where: { id: personId },
      include: {
        contentPersons: { select: { id: true } },
      },
    });

    if (!existingPerson) {
      throw new NotFoundException('Такого человека не существует');
    }

    if (existingPerson.contentPersons.length > 0) {
      throw new BadRequestException(
        'Нельзя удалить человека, который есть в фильмах',
      );
    }

    const person = await this.prismaService.person.delete({
      where: { id: personId },
    });

    return person;
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

  async createPersonRole(userId: string, dto: CreatePersonRoleDto) {
    const existingRole = await this.prismaService.personRole.findUnique({
      where: { name: dto.name },
    });

    if (existingRole) {
      throw new ConflictException('Такая роль уже существует');
    }

    const role = await this.prismaService.personRole.create({
      data: {
        name: dto.name,
      },
    });

    return role;
  }

  async updatePersonRole(
    userId: string,
    roleId: string,
    dto: UpdatePersonRoleDto,
  ) {
    await this.prismaService.personRole.findUnique({
      where: { id: roleId },
    });

    const existingRole = await this.prismaService.personRole.findUnique({
      where: { name: dto.name },
    });

    if (existingRole) {
      throw new ConflictException('Такая роль уже существует');
    }

    const role = await this.prismaService.personRole.update({
      where: { id: roleId },
      data: {
        name: dto.name,
      },
    });

    return role;
  }

  async deletePersonRole(userId: string, roleId: string) {
    const existingRole = await this.prismaService.personRole.findUnique({
      where: { id: roleId },
    });

    if (!existingRole) {
      throw new ConflictException('Роль не найдена');
    }
    const role = await this.prismaService.personRole.delete({
      where: { id: roleId },
    });

    return role;
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

  private async getSeriesWithDetails(contentId: string) {
    return await this.prismaService.content.findUnique({
      where: { id: contentId },
      include: {
        series: true,
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
}
