import { Injectable } from '@nestjs/common';
import { FileService } from 'src/file/file.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MovieService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly fileService: FileService,
  ) {}

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
