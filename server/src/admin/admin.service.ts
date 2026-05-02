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
import { CreateEpisodeDto } from 'src/episode/dto/create-episode.dto';
import { UpdateEpisodeDto } from 'src/episode/dto/update-episode.dto';
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

    // 1. Создаем контент
    const content = await this.prismaService.content.create({
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

    console.log('✅ Content created with ID:', content.id);

    // 2. Создаем movie
    await this.prismaService.movie.create({
      data: {
        contentId: content.id,
        duration: dto.duration,
        budget: Number(dto.budget),
      },
    });

    console.log('✅ Movie created for content:', content.id);

    // 3. Добавляем жанры
    if (dto.genreIds?.length) {
      await this.addGenresToContent(
        content.id,
        dto.genreIds,
        this.prismaService,
      );
    }

    // 4. Добавляем персон
    if (dto.persons?.length) {
      await this.addPersonsToContent(
        content.id,
        dto.persons,
        this.prismaService,
      );
    }

    // 5. Получаем и возвращаем
    return this.getMovieWithDetails(content.id);
  }

  async updateMovie(contentId: string, dto: UpdateMovieDto, userId: string) {
    const existingMovie = await this.prismaService.content.findFirst({
      where: {
        OR: [{ title: dto.title }, { originalTitle: dto.originalTitle }],
        NOT: { id: contentId },
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
    // Начинаем транзакцию
    return this.prismaService.$transaction(async (prisma) => {
      // 1. Удаляем закладки
      await prisma.bookmark.deleteMany({
        where: { contentId },
      });

      // 2. Удаляем оценки контента
      await prisma.contentRating.deleteMany({
        where: { contentId },
      });

      // 3. Удаляем комментарии к контенту
      await prisma.comment.deleteMany({
        where: { contentId },
      });

      // 4. Удаляем статусы просмотра
      await prisma.userWatchStatus.deleteMany({
        where: { contentId },
      });

      // 5. Удаляем связи с жанрами
      await prisma.contentGenre.deleteMany({
        where: { contentId },
      });

      // 6. Удаляем связи с персонами
      await prisma.contentPerson.deleteMany({
        where: { contentId },
      });

      // 7. Удаляем запись из таблицы movies (если есть)
      await prisma.movie.deleteMany({
        where: { contentId },
      });

      // 8. Удаляем запись из таблицы series (если есть)
      await prisma.series.deleteMany({
        where: { contentId },
      });

      // 9. Получаем информацию о файлах для удаления
      const content = await prisma.content.findUnique({
        where: { id: contentId },
        select: { posterUrl: true, backdropUrl: true },
      });

      // 10. Удаляем сам контент
      const deletedContent = await prisma.content.delete({
        where: { id: contentId },
      });

      // 11. Удаляем файлы
      if (content?.posterUrl) {
        await this.fileService.deleteFile(content.posterUrl);
      }
      if (content?.backdropUrl) {
        await this.fileService.deleteFile(content.backdropUrl);
      }

      return deletedContent;
    });
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
    return this.prismaService.$transaction(async (prisma) => {
      // 1. Находим сериал в таблице series
      const series = await prisma.series.findUnique({
        where: { contentId },
        select: { id: true },
      });

      if (series) {
        // 2. Удаляем эпизоды
        await prisma.episode.deleteMany({
          where: { seriesId: series.id },
        });
      }

      // 3. Удаляем закладки
      await prisma.bookmark.deleteMany({
        where: { contentId },
      });

      // 4. Удаляем оценки контента
      await prisma.contentRating.deleteMany({
        where: { contentId },
      });

      // 5. Удаляем комментарии
      await prisma.comment.deleteMany({
        where: { contentId },
      });

      // 6. Удаляем статусы просмотра
      await prisma.userWatchStatus.deleteMany({
        where: { contentId },
      });

      // 7. Удаляем связи с жанрами
      await prisma.contentGenre.deleteMany({
        where: { contentId },
      });

      // 8. Удаляем связи с персонами
      await prisma.contentPerson.deleteMany({
        where: { contentId },
      });

      // 9. Удаляем запись из таблицы series
      if (series) {
        await prisma.series.delete({
          where: { id: series.id },
        });
      }

      // 10. Получаем информацию о файлах
      const content = await prisma.content.findUnique({
        where: { id: contentId },
        select: { posterUrl: true, backdropUrl: true },
      });

      // 11. Удаляем сам контент
      const deletedContent = await prisma.content.delete({
        where: { id: contentId },
      });

      // 12. Удаляем файлы
      if (content?.posterUrl) {
        await this.fileService.deleteFile(content.posterUrl);
      }
      if (content?.backdropUrl) {
        await this.fileService.deleteFile(content.backdropUrl);
      }

      return deletedContent;
    });
  }
  async uploadPoster(
    contentId: string,
    posterFile: Express.Multer.File,
    userId: string,
  ) {
    const content = await this.prismaService.content.findUnique({
      where: { id: contentId },
    });

    if (!content) {
      throw new NotFoundException('Контент не найден');
    }

    // Сохраняем файл
    const poster = await this.fileService.saveFile(posterFile, FileType.POSTER);

    // Удаляем старый постер, если есть
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
        persons: { include: { person: true, role: true } },
      },
    });
  }

  async uploadBackdrop(
    contentId: string,
    backdropFile: Express.Multer.File,
    userId: string,
  ) {
    const content = await this.prismaService.content.findUnique({
      where: { id: contentId },
    });

    if (!content) {
      throw new NotFoundException('Контент не найден');
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
        persons: { include: { person: true, role: true } },
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
    console.log('🔍 Getting movie details for ID:', contentId);

    const result = await this.prismaService.content.findUnique({
      where: { id: contentId },
      include: {
        movie: true,
        genres: { include: { genre: true } },
        persons: { include: { person: true, role: true } },
      },
    });

    console.log('🔍 Raw result:', result);

    if (!result) return null;

    if (result.movie?.budget) {
      (result.movie as any).budget = Number(result.movie.budget);
    }

    return result;
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

  // ========== УПРАВЛЕНИЕ ЭПИЗОДАМИ ==========

  async createEpisode(
    contentId: string,
    dto: CreateEpisodeDto,
    userId: string,
  ) {
    // 1. Находим контент с типом SERIES
    const content = await this.prismaService.content.findUnique({
      where: { id: contentId, contentType: ContentType.SERIES },
      include: { series: true },
    });

    if (!content || !content.series) {
      throw new NotFoundException('Сериал не найден');
    }

    // 2. Получаем внутренний ID сериала из таблицы series
    const seriesId = content.series.id;

    // 3. Проверяем, не существует ли уже такой эпизод
    const existingEpisode = await this.prismaService.episode.findUnique({
      where: {
        seriesId_seasonNumber_episodeNumber: {
          seriesId,
          seasonNumber: dto.seasonNumber,
          episodeNumber: dto.episodeNumber,
        },
      },
    });

    if (existingEpisode) {
      throw new ConflictException('Эпизод с таким номером уже существует');
    }

    // 4. Создаем эпизод
    const episode = await this.prismaService.episode.create({
      data: {
        seriesId,
        seasonNumber: dto.seasonNumber,
        episodeNumber: dto.episodeNumber,
        title: dto.title,
        duration: dto.duration,
        description: dto.description,
        airDate: dto.airDate ? new Date(dto.airDate) : null,
      },
      include: {
        series: {
          include: { content: true },
        },
      },
    });

    // 5. Обновляем общее количество эпизодов в сериале
    const episodesCount = await this.prismaService.episode.count({
      where: { seriesId },
    });

    await this.prismaService.series.update({
      where: { id: seriesId },
      data: { episodesCount },
    });

    return episode;
  }

  async updateEpisode(
    episodeId: string,
    dto: UpdateEpisodeDto,
    userId: string,
  ) {
    const episode = await this.prismaService.episode.findUnique({
      where: { id: episodeId },
      include: { series: true },
    });

    if (!episode) {
      throw new NotFoundException('Эпизод не найден');
    }

    // Если меняется сезон или номер, проверяем дубликат
    if (dto.seasonNumber || dto.episodeNumber) {
      const seasonNumber = dto.seasonNumber ?? episode.seasonNumber;
      const episodeNumber = dto.episodeNumber ?? episode.episodeNumber;

      const existing = await this.prismaService.episode.findFirst({
        where: {
          seriesId: episode.seriesId,
          seasonNumber,
          episodeNumber,
          NOT: { id: episodeId },
        },
      });

      if (existing) {
        throw new ConflictException('Эпизод с таким номером уже существует');
      }
    }

    // Обновляем эпизод
    const updatedEpisode = await this.prismaService.episode.update({
      where: { id: episodeId },
      data: {
        seasonNumber: dto.seasonNumber,
        episodeNumber: dto.episodeNumber,
        title: dto.title,
        duration: dto.duration,
        description: dto.description,
        airDate: dto.airDate ? new Date(dto.airDate) : undefined,
      },
      include: {
        series: {
          include: { content: true },
        },
      },
    });

    return updatedEpisode;
  }

  async deleteEpisode(episodeId: string, userId: string) {
    const episode = await this.prismaService.episode.findUnique({
      where: { id: episodeId },
      include: { series: true },
    });

    if (!episode) {
      throw new NotFoundException('Эпизод не найден');
    }

    const seriesId = episode.seriesId;

    // Удаляем эпизод
    await this.prismaService.episode.delete({
      where: { id: episodeId },
    });

    // Обновляем общее количество эпизодов в сериале
    const episodesCount = await this.prismaService.episode.count({
      where: { seriesId },
    });

    await this.prismaService.series.update({
      where: { id: seriesId },
      data: { episodesCount },
    });

    return { success: true, message: 'Эпизод успешно удален' };
  }

  // ========== УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ ==========

  async getUsers() {
    return this.prismaService.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        emailVerified: true,
        avatarUrl: true,
        telegramId: true,
        bio: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUserById(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        emailVerified: true,
        avatarUrl: true,
        telegramId: true,
        bio: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user;
  }

  async updateUserRole(userId: string, role: string, adminId: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    if (userId === adminId) {
      throw new BadRequestException('Нельзя изменить свою роль');
    }

    const validRoles = ['ADMIN', 'MODERATOR', 'USER'];
    if (!validRoles.includes(role)) {
      throw new BadRequestException('Некорректная роль');
    }

    const updatedUser = await this.prismaService.user.update({
      where: { id: userId },
      data: { role: role as any },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    });

    return { message: 'Роль пользователя обновлена', user: updatedUser };
  }

  async deleteUser(userId: string, adminId: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    if (userId === adminId) {
      throw new BadRequestException('Нельзя удалить самого себя');
    }

    // Удаляем связанные данные
    await this.prismaService.$transaction([
      this.prismaService.bookmark.deleteMany({ where: { userId } }),
      this.prismaService.comment.deleteMany({ where: { userId } }),
      this.prismaService.contentRating.deleteMany({ where: { userId } }),
      this.prismaService.commentRating.deleteMany({ where: { userId } }),
      this.prismaService.userWatchStatus.deleteMany({ where: { userId } }),
      this.prismaService.watchHistory.deleteMany({ where: { userId } }),
      this.prismaService.notification.deleteMany({ where: { userId } }),
      this.prismaService.user.delete({ where: { id: userId } }),
    ]);

    return { message: 'Пользователь удален' };
  }

  // ========== УПРАВЛЕНИЕ КОММЕНТАРИЯМИ ==========

  async getComments(status?: string, page: number = 1) {
    const limit = 20;
    const where: any = {};

    const [items, total] = await Promise.all([
      this.prismaService.comment.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
          content: {
            select: {
              id: true,
              title: true,
              posterUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prismaService.comment.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getCommentById(id: string) {
    const comment = await this.prismaService.comment.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        content: {
          select: {
            id: true,
            title: true,
            posterUrl: true,
          },
        },
        reports: true,
      },
    });

    if (!comment) {
      throw new NotFoundException('Комментарий не найден');
    }

    return comment;
  }

  async deleteComment(commentId: string, adminId: string) {
    const comment = await this.prismaService.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Комментарий не найден');
    }

    // Удаляем связанные данные
    await this.prismaService.$transaction([
      this.prismaService.commentRating.deleteMany({ where: { commentId } }),
      this.prismaService.commentReport.deleteMany({ where: { commentId } }),
      this.prismaService.comment.delete({ where: { id: commentId } }),
    ]);

    return { message: 'Комментарий удален' };
  }

  // ========== УПРАВЛЕНИЕ ЖАЛОБАМИ ==========

  async getReports() {
    const query = `
    SELECT 
      cr.id,
      cr.reason,
      cr.status,
      cr.created_at as "createdAt",
      cr.comment_id,
      cr.user_id as reporter_id,
      c.text as comment_text,
      c.user_id as comment_author_id,
      c.content_id,
      reporter.username as reporter_username,
      reporter.avatar_url as reporter_avatar,
      author.username as author_username,
      author.avatar_url as author_avatar,
      cont.title as content_title
    FROM comment_reports cr
    LEFT JOIN comments c ON cr.comment_id = c.id
    LEFT JOIN users reporter ON cr.user_id = reporter.id
    LEFT JOIN users author ON c.user_id = author.id
    LEFT JOIN contents cont ON c.content_id = cont.id
    ORDER BY cr.created_at DESC
  `;

    const results = await this.prismaService.$queryRawUnsafe<any[]>(query);

    console.log('📊 Результат запроса жалоб:', results);

    // Преобразуем результат в формат, который ожидает фронтенд
    return results.map((row) => ({
      id: row.id,
      reason: row.reason,
      status: row.status,
      createdAt: row.createdAt,
      comment: {
        id: row.comment_id,
        text: row.comment_text || 'Комментарий удалён',
        user: {
          id: row.comment_author_id,
          username: row.author_username || 'Неизвестный пользователь',
          avatarUrl: row.author_avatar,
        },
        content: {
          id: row.content_id,
          title: row.content_title || 'Контент удалён',
        },
      },
      user: {
        id: row.reporter_id,
        username: row.reporter_username || 'Неизвестный пользователь',
        avatarUrl: row.reporter_avatar,
      },
    }));
  }

  async resolveReport(id: string) {
    const query = `
    UPDATE comment_reports 
    SET status = 'resolved' 
    WHERE id = '${id}'
  `;

    await this.prismaService.$executeRawUnsafe(query);

    return { message: 'Жалоба решена' };
  }

  async rejectReport(id: string) {
    const query = `
    UPDATE comment_reports 
    SET status = 'rejected' 
    WHERE id = '${id}'
  `;

    await this.prismaService.$executeRawUnsafe(query);

    return { message: 'Жалоба отклонена' };
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
