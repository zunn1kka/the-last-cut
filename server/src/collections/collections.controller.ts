import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Authorization } from 'src/auth/decorators/authorization.decorator';
import { Authorized } from 'src/auth/decorators/authorized.decorator';
import { CollectionsService } from './collections.service';
import { AddItemDto } from './dto/add-item.dto';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { ReorderItemsDto } from './dto/reorder-items.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';

@ApiTags('collections')
@ApiBearerAuth('JWT-auth')
@Controller('collections')
@Authorization()
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Post()
  @ApiOperation({ summary: 'Создать сборник' })
  create(@Authorized('id') userId: string, @Body() dto: CreateCollectionDto) {
    return this.collectionsService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить все мои сборники' })
  findAll(@Authorized('id') userId: string) {
    return this.collectionsService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить сборник по ID' })
  findOne(@Authorized('id') userId: string, @Param('id') id: string) {
    return this.collectionsService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить сборник' })
  update(
    @Authorized('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCollectionDto,
  ) {
    return this.collectionsService.update(userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить сборник' })
  delete(@Authorized('id') userId: string, @Param('id') id: string) {
    return this.collectionsService.delete(userId, id);
  }

  @Post(':id/items')
  @ApiOperation({ summary: 'Добавить элемент в сборник' })
  addItem(
    @Authorized('id') userId: string,
    @Param('id') id: string,
    @Body() dto: AddItemDto,
  ) {
    return this.collectionsService.addItem(userId, id, dto);
  }

  @Delete(':id/items/:contentId')
  @ApiOperation({ summary: 'Удалить элемент из сборника' })
  removeItem(
    @Authorized('id') userId: string,
    @Param('id') id: string,
    @Param('contentId') contentId: string,
  ) {
    return this.collectionsService.removeItem(userId, id, contentId);
  }

  @Patch(':id/items/reorder')
  @ApiOperation({ summary: 'Изменить порядок элементов в сборнике' })
  reorderItems(
    @Authorized('id') userId: string,
    @Param('id') id: string,
    @Body() dto: ReorderItemsDto,
  ) {
    return this.collectionsService.reorderItems(userId, id, dto.items);
  }
}
