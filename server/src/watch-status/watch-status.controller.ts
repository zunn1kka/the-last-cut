import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { WatchStatus } from 'generated/prisma/enums';
import { Authorization } from 'src/auth/decorators/authorization.decorator';
import { Authorized } from 'src/auth/decorators/authorized.decorator';
import { CreateWatchStatusDto } from './dto/create-watch-status.dto';
import { UpdateWatchStatusDto } from './dto/update-watch-status.dto';
import { WatchStatusService } from './watch-status.service';

@ApiTags('watch-status')
@ApiBearerAuth('JWT-auth')
@Controller('watch-status')
@Authorization()
export class WatchStatusController {
  constructor(private readonly watchStatusService: WatchStatusService) {}

  @Post(':contentId')
  @ApiOperation({ summary: 'Создать или обновить статус просмотра' })
  @ApiResponse({ status: 201, description: 'Статус создан' })
  async create(
    @Authorized('id') userId: string,
    @Param('contentId') contentId: string,
    @Body() dto: CreateWatchStatusDto,
  ) {
    console.log('📥 Получен статус от фронтенда:', dto.status);
    console.log('📥 Тип статуса:', typeof dto.status);

    const result = await this.watchStatusService.create(userId, contentId, dto);

    console.log('📤 Сохранённый статус в БД:', result.status);

    return result;
  }

  @Get()
  @ApiOperation({ summary: 'Получить все статусы просмотра пользователя' })
  async findAll(@Authorized('id') userId: string) {
    return this.watchStatusService.findAll(userId);
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Получить статусы по фильтру' })
  async findByStatus(
    @Authorized('id') userId: string,
    @Param('status') status: WatchStatus,
  ) {
    return this.watchStatusService.findByStatus(userId, status);
  }

  // @Get('stats')
  // @ApiOperation({ summary: 'Получить статистику просмотров' })
  // async getStats(@Authorized('id') userId: string) {
  //   return this.watchStatusService.getStats(userId);
  // }

  @Get(':contentId')
  @ApiOperation({ summary: 'Получить статус для конкретного контента' })
  async findOne(
    @Authorized('id') userId: string,
    @Param('contentId') contentId: string,
  ) {
    return this.watchStatusService.findOne(userId, contentId);
  }

  @Put(':contentId')
  @ApiOperation({ summary: 'Обновить статус просмотра' })
  async update(
    @Authorized('id') userId: string,
    @Param('contentId') contentId: string,
    @Body() dto: UpdateWatchStatusDto,
  ) {
    return this.watchStatusService.update(userId, contentId, dto);
  }

  @Delete(':contentId')
  @ApiOperation({ summary: 'Удалить статус просмотра' })
  async delete(
    @Authorized('id') userId: string,
    @Param('contentId') contentId: string,
  ) {
    return this.watchStatusService.delete(userId, contentId);
  }
}
