import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PersonRoleService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll() {
    return await this.prismaService.personRole.findMany({});
  }

  async findOne(roleId: string) {
    return await this.prismaService.personRole.findUnique({
      where: { id: roleId },
    });
  }
}
