import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Authorization } from 'src/auth/decorators/authorization.decorator';
import { Authorized } from 'src/auth/decorators/authorized.decorator';
import { CreateCommentRatingDto } from './dto/create-comment-rating.dto';
import { CreateContentRatingDto } from './dto/create-content-rating.dto';
import { UpdateCommentRatingDto } from './dto/update-comment-rating.dto';
import { UpdateContentRatingDto } from './dto/update-content-rating.dto';
import { RatingsService } from './ratings.service';

@ApiTags('ratings')
@ApiBearerAuth('JWT-auth')
@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Get('content/:contentId')
  @ApiOperation({ summary: 'Получить все оценки контента' })
  @ApiParam({ name: 'contentId', description: 'UUID контента' })
  @ApiResponse({ status: 200, description: 'Список оценок успешно получен' })
  @ApiResponse({ status: 404, description: 'Контент не найден' })
  async findAllRatingsInContent(@Param('contentId') contentId: string) {
    return await this.ratingsService.findAllRatingsInContent(contentId);
  }

  @Get('my/content')
  @Authorization()
  @ApiOperation({ summary: 'Получить мои оценки контента' })
  @ApiResponse({
    status: 200,
    description: 'Список оценок пользователя успешно получен',
  })
  @ApiResponse({ status: 401, description: 'Пользователь не авторизован' })
  async findAllMyRatingsInContents(@Authorized('id') userId: string) {
    return await this.ratingsService.findAllUserRatingsInContents(userId);
  }

  @Get('user/:userId/content')
  @ApiOperation({ summary: 'Получить оценки контента другого пользователя' })
  @ApiParam({ name: 'userId', description: 'UUID пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Список оценок пользователя успешно получен',
  })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  async findAllUserRatingsInContents(@Param('userId') userId: string) {
    return await this.ratingsService.findAllUserRatingsInContents(userId);
  }

  @Post('content/:contentId')
  @Authorization()
  @ApiOperation({ summary: 'Оценить контент' })
  @ApiParam({ name: 'contentId', description: 'UUID контента' })
  @ApiResponse({ status: 201, description: 'Оценка успешно сохранена' })
  @ApiResponse({
    status: 400,
    description: 'Невалидная оценка (должна быть 1-10)',
  })
  @ApiResponse({ status: 401, description: 'Пользователь не авторизован' })
  @ApiResponse({ status: 404, description: 'Контент не найден' })
  @ApiResponse({ status: 409, description: 'Вы уже оценили этот контент' })
  async rateContent(
    @Authorized('id') userId: string,
    @Param('contentId') contentId: string,
    @Body() dto: CreateContentRatingDto,
  ) {
    return await this.ratingsService.rateContent(userId, contentId, dto);
  }

  @Put('content/:contentId')
  @Authorization()
  @ApiOperation({ summary: 'Изменить оценку контента' })
  @ApiParam({ name: 'contentId', description: 'UUID контента' })
  @ApiResponse({ status: 200, description: 'Оценка успешно обновлена' })
  @ApiResponse({ status: 401, description: 'Пользователь не авторизован' })
  @ApiResponse({ status: 404, description: 'Оценка не найдена' })
  async updateRateContent(
    @Authorized('id') userId: string,
    @Param('contentId') contentId: string,
    @Body() dto: UpdateContentRatingDto,
  ) {
    return await this.ratingsService.updateRateContent(userId, contentId, dto);
  }

  @Delete('content/:contentId')
  @Authorization()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить оценку контента' })
  @ApiParam({ name: 'contentId', description: 'UUID контента' })
  @ApiResponse({ status: 204, description: 'Оценка успешно удалена' })
  @ApiResponse({ status: 401, description: 'Пользователь не авторизован' })
  @ApiResponse({ status: 404, description: 'Оценка не найдена' })
  async removeRateContent(
    @Authorized('id') userId: string,
    @Param('contentId') contentId: string,
  ) {
    return await this.ratingsService.removeRateContent(userId, contentId);
  }

  @Get('comment/:commentId')
  @ApiOperation({ summary: 'Получить все оценки комментария' })
  @ApiParam({ name: 'commentId', description: 'UUID комментария' })
  @ApiResponse({ status: 200, description: 'Список оценок успешно получен' })
  @ApiResponse({ status: 404, description: 'Комментарий не найден' })
  async findAllRatingsInComment(@Param('commentId') commentId: string) {
    return await this.ratingsService.findAllRatingsInComment(commentId);
  }

  @Get('my/comment')
  @Authorization()
  @ApiOperation({ summary: 'Получить мои оценки комментариев' })
  @ApiResponse({
    status: 200,
    description: 'Список оценок пользователя успешно получен',
  })
  @ApiResponse({ status: 401, description: 'Пользователь не авторизован' })
  async findAllMyRatingsInComments(@Authorized('id') userId: string) {
    return await this.ratingsService.findAllUserCommentRatingsInContents(
      userId,
    );
  }

  @Get('user/:userId/comment')
  @ApiOperation({
    summary: 'Получить оценки комментариев другого пользователя',
  })
  @ApiParam({ name: 'userId', description: 'UUID пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Список оценок пользователя успешно получен',
  })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  async findAllUserRatingsInComments(@Param('userId') userId: string) {
    return await this.ratingsService.findAllUserCommentRatingsInContents(
      userId,
    );
  }

  @Post('comment/:commentId')
  @Authorization()
  @ApiOperation({ summary: 'Оценить комментарий (лайк/дизлайк)' })
  @ApiParam({ name: 'commentId', description: 'UUID комментария' })
  @ApiResponse({ status: 201, description: 'Оценка успешно сохранена' })
  @ApiResponse({ status: 401, description: 'Пользователь не авторизован' })
  @ApiResponse({ status: 404, description: 'Комментарий не найден' })
  @ApiResponse({ status: 409, description: 'Вы уже оценили этот комментарий' })
  async rateComment(
    @Authorized('id') userId: string,
    @Param('commentId') commentId: string,
    @Body() dto: CreateCommentRatingDto,
  ) {
    return await this.ratingsService.rateComment(userId, commentId, dto);
  }

  @Put('comment/:commentId')
  @Authorization()
  @ApiOperation({ summary: 'Изменить оценку комментария' })
  @ApiParam({ name: 'commentId', description: 'UUID комментария' })
  @ApiResponse({ status: 200, description: 'Оценка успешно обновлена' })
  @ApiResponse({ status: 401, description: 'Пользователь не авторизован' })
  @ApiResponse({ status: 404, description: 'Оценка не найдена' })
  async updateRateComment(
    @Authorized('id') userId: string,
    @Param('commentId') commentId: string,
    @Body() dto: UpdateCommentRatingDto,
  ) {
    return await this.ratingsService.updateRateComment(userId, commentId, dto);
  }

  @Delete('comment/:commentId')
  @Authorization()
  @ApiOperation({ summary: 'Удалить оценку комментария' })
  @ApiParam({ name: 'commentId', description: 'UUID комментария' })
  @ApiResponse({ status: 204, description: 'Оценка успешно удалена' })
  @ApiResponse({ status: 401, description: 'Пользователь не авторизован' })
  @ApiResponse({ status: 404, description: 'Оценка не найдена' })
  async removeRateComment(
    @Authorized('id') userId: string,
    @Param('commentId') commentId: string,
  ) {
    return await this.ratingsService.removeRateComment(userId, commentId);
  }
}
