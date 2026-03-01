import { Injectable, NotFoundException } from '@nestjs/common';
import { FileService } from 'src/file/file.service';
import { PrismaService } from 'src/prisma/prisma.service';

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

  async findAll() {
    return await this.prismaService.person.findMany({
      select: this.infoPerson,
    });
  }

  async findAllInMovie(contentId: string) {
    const persons = await this.prismaService.contentPerson.findMany({
      where: { contentId },
      select: { person: { select: { fullname: true, photoUrl: true } } },
    });

    return persons;
  }

  async findOne(personId: string) {
    const person = await this.prismaService.person.findUnique({
      where: { id: personId },
      select: this.infoPerson,
    });

    if (!person) {
      throw new NotFoundException('Такого человека не существует');
    }

    return person;
  }

  async search(query: string) {
    const where: any = {};

    if (query && query.trim()) {
      where.fullName = {
        contains: query,
        mode: 'insensitive',
      };
    }

    return this.prismaService.person.findMany({
      where,
      select: this.infoPerson,
      orderBy: { fullname: 'asc' },
    });
  }
}
