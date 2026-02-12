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
import { EmailVerified } from 'src/auth/decorators/email-verified.decorator';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Authorization()
@ApiTags('comments')
@ApiBearerAuth('JWT-auth')
@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get(':movieId')
  @ApiOperation({
    summary: 'Получить комментарии к фильму',
    description:
      'Возвращает все комментарии к указанному фильму с пагинацией и сортировкой по дате.',
  })
  @ApiParam({
    name: 'movieId',
    description: 'UUID идентификатор фильма',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    description: 'Комментарии успешно получены',
  })
  @ApiBadRequestResponse({
    description: 'Невалидный UUID фильма или параметры пагинации',
  })
  @ApiNotFoundResponse({
    description: 'Фильм не найден',
  })
  async findAllInMovie(@Param('movieId') movieId: string) {
    return await this.commentService.findAllInMovie(movieId);
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

  @Post(':movieId')
  @EmailVerified()
  @ApiOperation({
    summary: 'Создать комментарий',
    description:
      'Создает новый комментарий к фильму. Требуется подтвержденный email.',
  })
  @ApiParam({
    name: 'movieId',
    description: 'UUID идентификатор фильма',
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
    description: 'Фильм не найден',
  })
  @ApiConflictResponse({
    description: 'Пользователь уже оставлял комментарий к этому фильму',
  })
  async createComment(
    @Param('movieId') movieId: string,
    @Authorized('id') userId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return await this.commentService.create(userId, movieId, dto);
  }

  @Put(':commentId')
  @EmailVerified()
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
  @EmailVerified()
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
}
