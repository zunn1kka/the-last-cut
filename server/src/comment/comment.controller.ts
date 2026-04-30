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
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AdminOrModerator } from 'src/auth/decorators/admin-or-moderator.decorator';
import { Authorization } from 'src/auth/decorators/authorization.decorator';
import { Authorized } from 'src/auth/decorators/authorized.decorator';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@ApiTags('comments')
@ApiBearerAuth('JWT-auth')
@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get(':contentId')
  @ApiOperation({
    summary: 'Получить комментарии к контенту',
    description:
      'Возвращает все комментарии к указанному контенту с пагинацией и сортировкой по дате.',
  })
  @ApiParam({
    name: 'contentId',
    description: 'UUID идентификатор контента',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    description: 'Комментарии успешно получены',
  })
  @ApiBadRequestResponse({
    description: 'Невалидный UUID контента или параметры пагинации',
  })
  @ApiNotFoundResponse({
    description: 'Контент не найден',
  })
  async findAllInMovie(@Param('contentId') contentId: string) {
    return await this.commentService.findAllInMovie(contentId);
  }

  @Get('my')
  @Authorization()
  @ApiOperation({
    summary: 'Получить мои комментарии',
    description:
      'Возвращает список всех комментариев текущего авторизованного пользователя с пагинацией',
  })
  @ApiOkResponse({
    description: 'Список комментариев пользователя успешно получен',
    schema: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                example: '550e8400-e29b-41d4-a716-446655440001',
              },
              text: { type: 'string', example: 'Отличный фильм!' },
              rating: { type: 'number', example: 8, nullable: true },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              content: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    example: '550e8400-e29b-41d4-a716-446655440000',
                  },
                  title: { type: 'string', example: 'Убить Билла' },
                  posterUrl: {
                    type: 'string',
                    example: '/uploads/poster/abc123.jpg',
                    nullable: true,
                  },
                  contentType: { type: 'string', enum: ['MOVIE', 'SERIES'] },
                },
              },
              ratings: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    isPositive: { type: 'boolean' },
                    userId: { type: 'string' },
                  },
                },
              },
            },
          },
        },
        total: { type: 'number', example: 25 },
        page: { type: 'number', example: 1 },
        totalPages: { type: 'number', example: 2 },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Пользователь не авторизован',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Неверный токен' },
        error: { type: 'string', example: 'Unauthorized' },
        statusCode: { type: 'number', example: 401 },
      },
    },
  })
  @ApiForbiddenResponse({
    description: 'Доступ запрещен (email не подтвержден)',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Для выполнения этого действия необходимо подтвердить email',
        },
        error: { type: 'string', example: 'Forbidden' },
        statusCode: { type: 'number', example: 403 },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Успешный ответ',
    content: {
      'application/json': {
        example: {
          items: [
            {
              id: '550e8400-e29b-41d4-a716-446655440001',
              text: 'Отличный фильм! Особенно понравилась концовка.',
              rating: 9,
              createdAt: '2024-01-15T10:30:00.000Z',
              updatedAt: '2024-01-15T10:30:00.000Z',
              content: {
                id: '550e8400-e29b-41d4-a716-446655440000',
                title: 'Убить Билла',
                posterUrl: '/uploads/poster/abc123.jpg',
                contentType: 'MOVIE',
              },
              ratings: [
                { id: '1', isPositive: true, userId: 'user1' },
                { id: '2', isPositive: true, userId: 'user2' },
              ],
            },
          ],
          total: 1,
          page: 1,
          totalPages: 1,
        },
      },
    },
  })
  async getMyComments(@Authorized('id') userId: string) {
    return await this.commentService.findByUser(userId);
  }

  @Get(':commentId/replies')
  @ApiOperation({
    summary: 'Получить ответы на комментарий',
    description: 'Возвращает все ответы (реплаи) на указанный комментарий.',
  })
  @ApiParam({
    name: 'commentId',
    description: 'UUID идентификатор родительского комментария',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @ApiOkResponse({
    description: 'Ответы на комментарий успешно получены',
  })
  @ApiBadRequestResponse({
    description: 'Невалидный UUID комментария',
  })
  @ApiNotFoundResponse({
    description: 'Комментарий не найден',
  })
  async findReplies(@Param('commentId') commentId: string) {
    return await this.commentService.findReplies(commentId);
  }

  @Post(':contentId')
  @Authorization()
  // @EmailVerified()
  @ApiOperation({
    summary: 'Создать комментарий',
    description:
      'Создает новый комментарий к фильму. Требуется подтвержденный email.',
  })
  @ApiParam({
    name: 'contentId',
    description: 'UUID идентификатор контента',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    description: 'Данные для создания комментария',
    type: CreateCommentDto,
  })
  @ApiCreatedResponse({
    description: 'Комментарий успешно создан',
  })
  @ApiUnauthorizedResponse({
    description: 'Пользователь не авторизован',
  })
  @ApiForbiddenResponse({
    description: 'Email не подтвержден или недостаточно прав',
  })
  @ApiBadRequestResponse({
    description: 'Невалидные данные или UUID фильма',
  })
  @ApiNotFoundResponse({
    description: 'Контент не найден',
  })
  @ApiConflictResponse({
    description: 'Пользователь уже оставлял комментарий к этому контенту',
  })
  async createComment(
    @Param('contentId') contentId: string,
    @Authorized('id') userId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return await this.commentService.create(userId, contentId, dto);
  }

  @Put(':commentId')
  @Authorization()
  // @EmailVerified()
  @ApiOperation({
    summary: 'Обновить комментарий',
    description:
      'Обновляет текст или рейтинг комментария. Можно обновлять только свои комментарии.',
  })
  @ApiParam({
    name: 'commentId',
    description: 'UUID идентификатор комментария',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @ApiBody({
    description: 'Данные для обновления комментария',
    type: UpdateCommentDto,
  })
  @ApiOkResponse({
    description: 'Комментарий успешно обновлен',
  })
  @ApiUnauthorizedResponse({
    description: 'Пользователь не авторизован',
  })
  @ApiForbiddenResponse({
    description:
      'Email не подтвержден или недостаточно прав (нельзя редактировать чужие комментарии)',
  })
  @ApiBadRequestResponse({
    description: 'Невалидные данные или UUID комментария',
  })
  @ApiNotFoundResponse({
    description: 'Комментарий не найден',
  })
  async updateComment(
    @Param('commentId') commentId: string,
    @Authorized('id') userId: string,
    @Body() dto: UpdateCommentDto,
  ) {
    return await this.commentService.update(userId, commentId, dto);
  }

  @Delete(':commentId')
  // @EmailVerified()
  @AdminOrModerator()
  @ApiOperation({
    summary: 'Удалить комментарий',
    description:
      'Удаляет комментарий. Доступно только администраторам, модераторам',
  })
  @ApiParam({
    name: 'commentId',
    description: 'UUID идентификатор комментария',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @ApiResponse({
    description: 'Комментарий успешно удален',
  })
  @ApiUnauthorizedResponse({
    description: 'Пользователь не авторизован',
  })
  @ApiForbiddenResponse({
    description: 'Email не подтвержден или недостаточно прав',
  })
  @ApiNotFoundResponse({
    description: 'Комментарий не найден',
  })
  @ApiBadRequestResponse({
    description: 'Невалидный UUID комментария',
  })
  async deleteComment(
    @Param('commentId') commentId: string,
    @Authorized('id') userId: string,
  ) {
    return await this.commentService.delete(userId, commentId);
  }

  @Post(':commentId/report')
  @Authorization()
  @ApiOperation({ summary: 'Пожаловаться на комментарий' })
  @ApiParam({
    name: 'commentId',
    description: 'UUID идентификатор комментария',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        reason: { type: 'string', example: 'Спам' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Жалоба отправлена' })
  @ApiNotFoundResponse({ description: 'Комментарий не найден' })
  async reportComment(
    @Param('commentId') commentId: string,
    @Authorized('id') userId: string,
    @Body('reason') reason: string,
  ) {
    return await this.commentService.reportComment(userId, commentId, reason);
  }
}
