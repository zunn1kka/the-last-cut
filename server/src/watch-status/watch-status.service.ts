import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateWatchStatusDto } from './dto/create-watch-status.dto';
import { UpdateWatchStatusDto } from './dto/update-watch-status.dto';

@Injectable()
export class WatchStatusService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, contentId: string, dto: CreateWatchStatusDto) {
    const content = await this.prisma.content.findUnique({
      where: { id: contentId },
    });

    if (!content) {
      throw new NotFoundException('Контент не найден');
    }

    // Преобразуем в нижний регистр для БД
    const lowerStatus = dto.status.toLowerCase();
    const allowedStatuses = ['planned', 'watching', 'completed', 'dropped'];

    if (!allowedStatuses.includes(lowerStatus)) {
      throw new BadRequestException(`Недопустимый статус: ${dto.status}`);
    }

    const progressValue = dto.progress ?? 0;

    // Используем нижний регистр в SQL
    const query = `
      INSERT INTO user_watch_statuses (user_id, content_id, status, progress, updated_at)
      VALUES ('${userId}', '${contentId}', '${lowerStatus}', ${progressValue}, NOW())
      ON CONFLICT (user_id, content_id) 
      DO UPDATE SET 
        status = EXCLUDED.status,
        progress = EXCLUDED.progress,
        updated_at = NOW()
    `;

    await this.prisma.$executeRawUnsafe(query);

    const selectQuery = `
      SELECT * FROM user_watch_statuses 
      WHERE user_id = '${userId}' AND content_id = '${contentId}'
    `;

    const result = await this.prisma.$queryRawUnsafe<any[]>(selectQuery);
    const watchStatus = result[0];

    const contentData = await this.prisma.content.findUnique({
      where: { id: contentId },
      include: { movie: true, series: true },
    });

    return {
      ...watchStatus,
      content: contentData,
    };
  }

  async findAll(userId: string) {
    const query = `
      SELECT * FROM user_watch_statuses 
      WHERE user_id = '${userId}'
      ORDER BY updated_at DESC
    `;

    const results = await this.prisma.$queryRawUnsafe<any[]>(query);

    for (const item of results) {
      const content = await this.prisma.content.findUnique({
        where: { id: item.content_id },
        include: {
          movie: true,
          series: true,
          genres: { include: { genre: true } },
        },
      });
      item.content = content;
    }

    return results;
  }

  async findOne(userId: string, contentId: string) {
    console.log('🔍 findOne вызван:');
    console.log('   userId:', userId);
    console.log('   contentId:', contentId);

    try {
      const query = `
        SELECT * FROM user_watch_statuses 
        WHERE user_id = '${userId}' AND content_id = '${contentId}'
      `;

      console.log('   SQL запрос:', query);

      const result = await this.prisma.$queryRawUnsafe<any[]>(query);

      console.log('   Результат запроса:', result);

      const watchStatus = result[0];

      if (!watchStatus) {
        console.log('❌ Статус не найден');
        return null;
      }

      console.log('✅ Статус найден:', watchStatus);

      const content = await this.prisma.content.findUnique({
        where: { id: contentId },
        include: {
          movie: true,
          series: true,
          genres: { include: { genre: true } },
        },
      });

      return {
        ...watchStatus,
        content,
      };
    } catch (error) {
      console.error('❌ Ошибка в findOne:', error);
      throw error;
    }
  }

  async findByStatus(userId: string, status: string) {
    const lowerStatus = status.toLowerCase();

    const query = `
      SELECT * FROM user_watch_statuses 
      WHERE user_id = '${userId}' AND status = '${lowerStatus}'
      ORDER BY updated_at DESC
    `;

    const results = await this.prisma.$queryRawUnsafe<any[]>(query);

    for (const item of results) {
      const content = await this.prisma.content.findUnique({
        where: { id: item.content_id },
        include: {
          movie: true,
          series: true,
          genres: { include: { genre: true } },
        },
      });
      item.content = content;
    }

    return results;
  }

  async update(userId: string, contentId: string, dto: UpdateWatchStatusDto) {
    const existing = await this.findOne(userId, contentId);

    if (!existing) {
      throw new NotFoundException('Статус просмотра не найден');
    }

    if (dto.status) {
      const lowerStatus = dto.status.toLowerCase();
      const query = `
        UPDATE user_watch_statuses 
        SET status = '${lowerStatus}', updated_at = NOW()
        WHERE user_id = '${userId}' AND content_id = '${contentId}'
      `;
      await this.prisma.$executeRawUnsafe(query);
    }

    if (dto.progress !== undefined) {
      const query = `
        UPDATE user_watch_statuses 
        SET progress = ${dto.progress}, updated_at = NOW()
        WHERE user_id = '${userId}' AND content_id = '${contentId}'
      `;
      await this.prisma.$executeRawUnsafe(query);
    }

    return this.findOne(userId, contentId);
  }

  async delete(userId: string, contentId: string) {
    const existing = await this.findOne(userId, contentId);

    if (!existing) {
      throw new NotFoundException('Статус просмотра не найден');
    }

    const query = `
      DELETE FROM user_watch_statuses 
      WHERE user_id = '${userId}' AND content_id = '${contentId}'
    `;

    await this.prisma.$executeRawUnsafe(query);

    return { message: 'Статус просмотра удален' };
  }

  async getStats(userId: string) {
    const totalQuery = `SELECT COUNT(*) as count FROM user_watch_statuses WHERE user_id = '${userId}'`;
    const watchingQuery = `SELECT COUNT(*) as count FROM user_watch_statuses WHERE user_id = '${userId}' AND status = 'watching'`;
    const plannedQuery = `SELECT COUNT(*) as count FROM user_watch_statuses WHERE user_id = '${userId}' AND status = 'planned'`;
    const completedQuery = `SELECT COUNT(*) as count FROM user_watch_statuses WHERE user_id = '${userId}' AND status = 'completed'`;
    const droppedQuery = `SELECT COUNT(*) as count FROM user_watch_statuses WHERE user_id = '${userId}' AND status = 'dropped'`;

    const total =
      await this.prisma.$queryRawUnsafe<{ count: string }[]>(totalQuery);
    const watching =
      await this.prisma.$queryRawUnsafe<{ count: string }[]>(watchingQuery);
    const planned =
      await this.prisma.$queryRawUnsafe<{ count: string }[]>(plannedQuery);
    const completed =
      await this.prisma.$queryRawUnsafe<{ count: string }[]>(completedQuery);
    const dropped =
      await this.prisma.$queryRawUnsafe<{ count: string }[]>(droppedQuery);

    return {
      total: Number(total[0]?.count || 0),
      watching: Number(watching[0]?.count || 0),
      planned: Number(planned[0]?.count || 0),
      completed: Number(completed[0]?.count || 0),
      dropped: Number(dropped[0]?.count || 0),
    };
  }
}
