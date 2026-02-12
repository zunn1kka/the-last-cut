import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
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
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AdminOnly } from 'src/auth/decorators/admin.decorator';
import { Authorization } from 'src/auth/decorators/authorization.decorator';
import { Authorized } from 'src/auth/decorators/authorized.decorator';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { GenreService } from './genre.service';

@Authorization()
@ApiTags('genres')
@ApiBearerAuth('JWT-auth')
@Controller('genres')
export class GenreController {
  constructor(private readonly genreService: GenreService) {}

  @Get()
  @ApiOperation({
    summary: 'Получить все жанры',
    description: 'Возвращает список всех жанров',
  })
  @ApiBadRequestResponse({
    description: 'Невалидные параметры пагинации',
  })
  async findAll() {
    return await this.genreService.findAll();
  }

  @Get(':genreId')
  @ApiOperation({
    summary: 'Получить жанр по ID',
    description:
      'Возвращает информацию о конкретном жанре по его идентификатору.',
  })
  @ApiParam({
    name: 'genreId',
    description: 'UUID идентификатор жанра',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    description: 'Жанр успешно найден',
  })
  @ApiNotFoundResponse({
    description: 'Жанр с указанным ID не найден',
  })
  @ApiBadRequestResponse({
    description: 'Невалидный UUID идентификатор',
  })
  async findOne(@Param('genreId') genreId: string) {
    return await this.genreService.findOne(genreId);
  }

  @Get('search')
  @ApiOperation({
    summary: 'Поиск жанров',
    description: 'Поиск жанров по названию. Возвращает список совпадений.',
  })
  @ApiQuery({
    name: 'q',
    required: true,
    description: 'Поисковый запрос',
    example: 'фант',
    type: String,
  })
  @ApiOkResponse({
    description: 'Результаты поиска успешно получены',
  })
  @ApiBadRequestResponse({
    description: 'Поисковый запрос слишком короткий или отсутствует',
  })
  async search(@Query('q') search: string) {
    return await this.genreService.search(search.trim());
  }

  @Post()
  @AdminOnly()
  @ApiOperation({
    summary: 'Создать новый жанр',
    description: 'Создает новый жанр. Только для администраторов.',
  })
  @ApiBody({
    description: 'Данные для создания жанра',
    type: CreateGenreDto,
  })
  @ApiCreatedResponse({
    description: 'Жанр успешно создан',
    type: CreateGenreDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Пользователь не авторизован',
  })
  @ApiForbiddenResponse({
    description: 'Недостаточно прав (требуется роль ADMIN)',
  })
  @ApiBadRequestResponse({
    description: 'Невалидные данные',
  })
  @ApiConflictResponse({
    description: 'Жанр с таким названием или slug уже существует',
  })
  async create(@Authorized('id') userId: string, @Body() dto: CreateGenreDto) {
    return await this.genreService.create(userId, dto);
  }

  @Put(':genreId')
  @AdminOnly()
  @ApiOperation({
    summary: 'Обновить жанр',
    description: 'Обновляет информацию о жанре. Только для администраторов.',
  })
  @ApiParam({
    name: 'genreId',
    description: 'UUID идентификатор жанра',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    description: 'Данные для обновления жанра',
    type: UpdateGenreDto,
  })
  @ApiOkResponse({
    description: 'Жанр успешно обновлен',
    type: UpdateGenreDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Пользователь не авторизован',
  })
  @ApiForbiddenResponse({
    description: 'Недостаточно прав (требуется роль ADMIN)',
  })
  @ApiNotFoundResponse({
    description: 'Жанр с указанным ID не найден',
  })
  @ApiBadRequestResponse({
    description: 'Невалидные данные или ID',
  })
  @ApiConflictResponse({
    description: 'Жанр с таким названием или slug уже существует',
  })
  async update(
    @Authorized('id') userId: string,
    @Param('genreId') genreId: string,
    @Body() dto: UpdateGenreDto,
  ) {
    return await this.genreService.update(userId, genreId, dto);
  }

  @Delete(':genreId')
  @AdminOnly()
  @ApiOperation({
    summary: 'Удалить жанр',
    description: 'Удаляет жанр по ID. Только для администраторов.',
  })
  @ApiParam({
    name: 'genreId',
    description: 'UUID идентификатор жанра',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    description: 'Жанр успешно удален',
  })
  @ApiUnauthorizedResponse({
    description: 'Пользователь не авторизован',
  })
  @ApiForbiddenResponse({
    description: 'Недостаточно прав (требуется роль ADMIN)',
  })
  @ApiNotFoundResponse({
    description: 'Жанр с указанным ID не найден',
  })
  @ApiBadRequestResponse({
    description: 'Невалидный UUID идентификатор',
  })
  @ApiConflictResponse({
    description: 'Невозможно удалить жанр, так как он используется в фильмах',
  })
  async delete(
    @Authorized('id') userId: string,
    @Param('genreId') genreId: string,
  ) {
    return await this.genreService.delete(userId, genreId);
  }
}
