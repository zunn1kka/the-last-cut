import { Injectable, NotFoundException } from '@nestjs/common';
import { FileService } from 'src/file/file.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { SearchPersonDto } from './dto/search-person.dto';

@Injectable()
export class PersonService {
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

  async findAll(page: number = 1, limit: number = 20, search?: string) {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;
    const skip = (page - 1) * limit;

    // Строим where условие для поиска
    const where: any = {};
    if (search) {
      where.fullname = {
        contains: search,
        mode: 'insensitive', // поиск без учета регистра
      };
    }

    // Получаем персон с пагинацией
    const [items, total] = await Promise.all([
      this.prismaService.person.findMany({
        where,
        select: this.infoPerson,
        skip,
        take: limitNum,
        orderBy: { fullname: 'asc' },
      }),
      this.prismaService.person.count({ where }),
    ]);

    return {
      items,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findAllInMovie(contentId: string) {
    const persons = await this.prismaService.contentPerson.findMany({
      where: { contentId },
      select: { person: { select: { fullname: true, photoUrl: true } } },
    });

    return persons;
  }

  async findPersonContent(personId: string) {
    const contentPersons = await this.prismaService.contentPerson.findMany({
      where: { personId },
      include: {
        content: {
          include: {
            movie: true,
            series: true,
          },
        },
        role: true,
      },
      orderBy: [{ content: { releaseYear: 'desc' } }, { importance: 'asc' }],
    });

    return contentPersons.map((cp) => ({
      id: cp.id,
      roleName: cp.roleName,
      role: cp.role,
      content: {
        id: cp.content.id,
        title: cp.content.title,
        posterUrl: cp.content.posterUrl,
        releaseYear: cp.content.releaseYear,
        contentType: cp.content.contentType,
        siteRating: cp.content.siteRating,
        imdbRating: cp.content.imdbRating,
        kinopoiskRating: cp.content.kinopoiskRating,
      },
    }));
  }

  async findOne(personId: string) {
    const person = await this.prismaService.person.findUnique({
      where: { id: personId },

      select: this.infoPerson,
    });

    if (!person) {
      throw new NotFoundException('Такого человека не существует');
    }

    return {
      ...person,
      birthDate: person.birthDate
        ? person.birthDate.toISOString().split('T')[0]
        : null,
      deathDate: person.deathDate
        ? person.deathDate.toISOString().split('T')[0]
        : null,
    };
  }

  async search(dto: SearchPersonDto) {
    const {
      query,
      birthYear,
      deathYear,
      sortBy = 'fullname',
      sortOrder = 'asc',
      page = 1,
      limit = 20,
    } = dto;

    const where: any = {};

    // 🔥 ИСПРАВЛЕНО: убрали search, оставили contains
    if (query && query.length >= 2) {
      where.fullname = {
        contains: query,
        mode: 'insensitive', // регистронезависимый поиск
      };
    }

    // Фильтр по году рождения
    if (birthYear) {
      where.birthDate = {
        gte: new Date(birthYear, 0, 1),
        lte: new Date(birthYear, 11, 31),
      };
    }

    // Фильтр по году смерти
    if (deathYear) {
      where.deathDate = {
        gte: new Date(deathYear, 0, 1),
        lte: new Date(deathYear, 11, 31),
      };
    }

    // Определяем поле для сортировки
    const orderBy: any = {};
    switch (sortBy) {
      case 'fullname':
        orderBy.fullname = sortOrder;
        break;
      case 'birthDate':
        orderBy.birthDate = sortOrder;
        break;
      case 'createdAt':
        orderBy.createdAt = sortOrder;
        break;
      default:
        orderBy.fullname = sortOrder;
    }

    console.log('🔍 Where condition:', JSON.stringify(where, null, 2));

    // Выполняем запрос с пагинацией
    const [items, total] = await Promise.all([
      this.prismaService.person.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          contentPersons: {
            take: 5,
            include: {
              content: {
                select: {
                  id: true,
                  title: true,
                  posterUrl: true,
                  releaseYear: true,
                },
              },
              role: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),
      this.prismaService.person.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async autocomplete(query: string, limit: number = 10) {
    if (!query || query.length < 2) {
      return [];
    }

    return this.prismaService.person.findMany({
      where: {
        fullname: {
          startsWith: query,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        fullname: true,
        photoUrl: true,
        birthDate: true,
      },
      orderBy: {
        fullname: 'asc',
      },
      take: limit,
    });
  }
}
