import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Authorized } from 'src/auth/decorators/authorized.decorator';
import { JwtGuard } from 'src/auth/guards/auth.guard';
import { BookmarksService } from './bookmarks.service';

@ApiTags('bookmarks')
@ApiBearerAuth('JWT-auth')
@Controller('bookmarks')
@UseGuards(JwtGuard)
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Get()
  @ApiOperation({ summary: 'Получить свои закладки' })
  @ApiResponse({
    status: 200,
    description: 'Список закладок успешно получен',
  })
  async findMyBookmarks(@Authorized('id') userId: string) {
    return await this.bookmarksService.findUserBookmarks(userId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Получить все закладки пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Список закладок успешно получен',
  })
  async findUserBookmarks(@Param('userId') userId: string) {
    return await this.bookmarksService.findUserBookmarks(userId);
  }

  @Post(':contentId')
  @ApiOperation({ summary: 'Добавить контент в закладки' })
  @ApiResponse({ status: 201, description: 'Контент добавлен в закладки' })
  @ApiResponse({ status: 409, description: 'Контент уже в закладках' })
  async addBookmark(
    @Param('contentId') contentId: string,
    @Authorized('id') userId: string,
  ) {
    return await this.bookmarksService.addBookmark(userId, contentId);
  }

  @Delete(':contentId')
  @ApiOperation({ summary: 'Удалить контент из закладок' })
  @ApiResponse({ status: 204, description: 'Контент удален из закладок' })
  @ApiResponse({ status: 404, description: 'Закладка не найдена' })
  async removeBookmark(
    @Param('contentId') contentId: string,
    @Authorized('id') userId: string,
  ) {
    return await this.bookmarksService.removeBookmark(userId, contentId);
  }
}
