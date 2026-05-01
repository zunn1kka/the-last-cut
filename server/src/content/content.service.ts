import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FindAllContentDto } from './dto/find-all-content.dto';

@Injectable()
export class ContentService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(dto: FindAllContentDto) {
    console.log('DBurl ', process.env.POSTGRES_URL);
    const {
      page = 1,
      limit = 20,
      contentType,
      genreIds,
      yearFrom,
      yearTo,
      ratingFrom,
      ratingTo,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
    } = dto;

    const where: any = {};

    // Фильтрация по типу контента
    if (contentType) {
      where.contentType = contentType;
    }

    // Поиск по тексту
    if (search && search.trim()) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { originalTitle: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Фильтрация по жанрам
    if (genreIds && genreIds.length > 0) {
      where.genres = {
        some: {
          genreId: { in: genreIds },
        },
      };
    }

    // Фильтрация по годам
    if (yearFrom || yearTo) {
      where.releaseYear = {};
      if (yearFrom) {
        where.releaseYear.gte = yearFrom;
      }
      if (yearTo) {
        where.releaseYear.lte = yearTo;
      }
    }

    // Фильтрация по рейтингу
    if (ratingFrom || ratingTo) {
      where.siteRating = {};
      if (ratingFrom) {
        where.siteRating.gte = ratingFrom;
      }
      if (ratingTo) {
        where.siteRating.lte = ratingTo;
      }
    }

    // Сортировка
    const validSortFields = [
      'title',
      'releaseYear',
      'createdAt',
      'updatedAt',
      'siteRating',
      'imdbRating',
      'kinopoiskRating',
    ];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const orderBy: any = { [sortField]: sortOrder };

    const [items, total] = await Promise.all([
      this.prismaService.content.findMany({
        where,
        include: {
          movie: true,
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
          contentRatings: {
            select: { rating: true },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prismaService.content.count({ where }),
    ]);

    const itemsWithRating = items.map((item) => {
      const ratings = item.contentRatings.map((r) => r.rating);
      const averageRating =
        ratings.length > 0
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length
          : null;

      const { contentRatings, ...rest } = item;
      return {
        ...rest,
        siteRating: averageRating ? Number(averageRating.toFixed(1)) : null,
      };
    });

    return {
      items: itemsWithRating,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
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
}
