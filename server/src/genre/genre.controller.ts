import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Authorization } from 'src/auth/decorators/authorization.decorator';
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
}
