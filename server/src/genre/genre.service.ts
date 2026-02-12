import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';

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

  async create(userId: string, dto: CreateGenreDto) {
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

  async update(userId: string, genreId: string, dto: UpdateGenreDto) {
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

  async delete(userId: string, genreId: string) {
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
