import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FileService } from 'src/file/file.service';
import { FileType } from 'src/lib/common/enums/type-file.enum';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';

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

  async create(
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

  async update(
    userId: string,
    personId: string,
    dto: UpdatePersonDto,
    personPhoto: Express.Multer.File,
  ) {
    const personAvatar = await this.findOne(personId);
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

  async delete(userId: string, personId: string) {
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
}
