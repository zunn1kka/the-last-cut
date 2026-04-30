import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddItemDto } from './dto/add-item.dto';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';

@Injectable()
export class CollectionsService {
  constructor(private prismaService: PrismaService) {}

  async create(userId: string, dto: CreateCollectionDto) {
    return await this.prismaService.collection.create({
      data: {
        userId,
        title: dto.title,
        description: dto.description,
        isPublic: dto.isPublic ?? true,
      },
    });
  }

  async findAll(userId: string) {
    return await this.prismaService.collection.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            content: {
              include: {
                movie: true,
                series: true,
              },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId?: string) {
    const collection = await this.prismaService.collection.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        items: {
          include: {
            content: {
              include: {
                movie: true,
                series: true,
                genres: { include: { genre: true } },
              },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!collection) {
      throw new NotFoundException('Сборник не найден');
    }

    // Если сборник приватный и не принадлежит пользователю
    if (!collection.isPublic && collection.userId !== userId) {
      throw new ForbiddenException('Нет доступа к этому сборнику');
    }

    return collection;
  }

  async update(userId: string, id: string, dto: UpdateCollectionDto) {
    await this.checkOwnership(userId, id);

    return this.prismaService.collection.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        isPublic: dto.isPublic,
      },
    });
  }

  async delete(userId: string, id: string) {
    await this.checkOwnership(userId, id);

    await this.prismaService.collection.delete({ where: { id } });
    return { message: 'Сборник удалён' };
  }

  async addItem(userId: string, collectionId: string, dto: AddItemDto) {
    await this.checkOwnership(userId, collectionId);

    // Проверяем, существует ли контент
    const content = await this.prismaService.content.findUnique({
      where: { id: dto.contentId },
    });
    if (!content) {
      throw new NotFoundException('Контент не найден');
    }

    // Получаем текущий максимальный order
    const lastItem = await this.prismaService.collectionItem.findFirst({
      where: { collectionId },
      orderBy: { order: 'desc' },
    });

    const newOrder = lastItem ? lastItem.order + 1 : 0;

    return this.prismaService.collectionItem.upsert({
      where: {
        collectionId_contentId: {
          collectionId,
          contentId: dto.contentId,
        },
      },
      update: {
        notes: dto.notes,
      },
      create: {
        collectionId,
        contentId: dto.contentId,
        notes: dto.notes,
        order: newOrder,
      },
      include: {
        content: {
          include: {
            movie: true,
            series: true,
          },
        },
      },
    });
  }

  async removeItem(userId: string, collectionId: string, contentId: string) {
    await this.checkOwnership(userId, collectionId);

    await this.prismaService.collectionItem.delete({
      where: {
        collectionId_contentId: {
          collectionId,
          contentId,
        },
      },
    });

    return { message: 'Элемент удалён из сборника' };
  }

  async reorderItems(
    userId: string,
    collectionId: string,
    items: { id: string; order: number }[],
  ) {
    await this.checkOwnership(userId, collectionId);

    const updates = items.map((item) =>
      this.prismaService.collectionItem.update({
        where: { id: item.id },
        data: { order: item.order },
      }),
    );

    await Promise.all(updates);
    return { message: 'Порядок обновлён' };
  }

  private async checkOwnership(userId: string, collectionId: string) {
    const collection = await this.prismaService.collection.findUnique({
      where: { id: collectionId },
      select: { userId: true },
    });

    if (!collection) {
      throw new NotFoundException('Сборник не найден');
    }

    if (collection.userId !== userId) {
      throw new ForbiddenException('Вы не владелец этого сборника');
    }
  }
}
