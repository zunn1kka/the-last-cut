import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePersonRoleDto } from './dto/create-person-role.dto';
import { UpdatePersonRoleDto } from './dto/update-person-role.dto';

@Injectable()
export class PersonRoleService {
  constructor(private readonly _prisma: PrismaService) {}

  async findAll() {
    return await this._prisma.personRole.findMany({});
  }

  async findOne(roleId: string) {
    return await this._prisma.personRole.findUnique({
      where: { id: roleId },
    });
  }

  async create(userId: string, dto: CreatePersonRoleDto) {
    const existingRole = await this._prisma.personRole.findUnique({
      where: { name: dto.name },
    });

    if (existingRole) {
      throw new ConflictException('Такая роль уже существует');
    }

    const role = await this._prisma.personRole.create({
      data: {
        name: dto.name,
      },
    });

    return role;
  }

  async update(userId: string, roleId: string, dto: UpdatePersonRoleDto) {
    await this.findOne(roleId);

    const existingRole = await this._prisma.personRole.findUnique({
      where: { name: dto.name },
    });

    if (existingRole) {
      throw new ConflictException('Такая роль уже существует');
    }

    const role = await this._prisma.personRole.update({
      where: { id: roleId },
      data: {
        name: dto.name,
      },
    });

    return role;
  }

  async delete(userId: string, roleId: string) {
    const existingRole = await this.findOne(roleId);

    if (!existingRole) {
      throw new ConflictException('Роль не найдена');
    }
    const role = await this._prisma.personRole.delete({
      where: { id: roleId },
    });

    return role;
  }
}
