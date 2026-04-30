import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Authorization } from 'src/auth/decorators/authorization.decorator';
import { SearchPersonDto } from './dto/search-person.dto';
import { PersonService } from './person.service';

@Authorization()
@ApiTags('persons')
@ApiBearerAuth('JWT-auth')
@Controller('persons')
export class PersonController {
  constructor(private readonly personService: PersonService) {}

  @ApiOperation({
    summary: 'Поиск персон',
    description: 'Поиск персон по имени, фамилии',
  })
  @ApiOkResponse({
    description: 'Результаты поиска успешно получены',
  })
  @ApiBadRequestResponse({
    description: 'Поисковый запрос слишком короткий или отсутствует',
  })
  @Get('search')
  @ApiOperation({ summary: 'Поиск персон с фильтрацией' })
  @ApiResponse({ status: 200, description: 'Результаты поиска' })
  async search(@Query() dto: SearchPersonDto) {
    return this.personService.search(dto);
  }

  @Get('autocomplete')
  @ApiOperation({ summary: 'Автодополнение для поиска персон' })
  @ApiQuery({ name: 'q', required: true, description: 'Поисковый запрос' })
  async autocomplete(@Query('q') query: string) {
    return this.personService.autocomplete(query);
  }

  @ApiOperation({
    summary: 'Получить всех персон контента',
    description:
      'Возвращает всех персон (актеров, режиссеров и т.д.), связанных с указанным контентом.',
  })
  @ApiParam({
    name: 'contentId',
    description: 'UUID идентификатор контента',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @ApiOkResponse({
    description: 'Персоны фильма успешно получены',
  })
  @ApiNotFoundResponse({
    description: 'Контент с указанным ID не найден',
  })
  @ApiBadRequestResponse({
    description: 'Невалидный UUID идентификатор',
  })
  @Get('content/:contentId')
  async findAllInMovie(@Param('contentId') contentId: string) {
    return await this.personService.findAllInMovie(contentId);
  }

  @Get(':id/content')
  @ApiOperation({ summary: 'Получить все работы персоны' })
  async getPersonContent(@Param('id') id: string) {
    return this.personService.findPersonContent(id);
  }

  @ApiOperation({
    summary: 'Получить персону по ID',
    description: 'Возвращает полную информацию о персоне включая фильмографию.',
  })
  @ApiParam({
    name: 'personId',
    description: 'UUID идентификатор персоны',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiOkResponse({
    description: 'Персона успешно найдена',
  })
  @ApiNotFoundResponse({
    description: 'Персона с указанным ID не найдена',
  })
  @ApiBadRequestResponse({
    description: 'Невалидный UUID идентификатор',
  })
  @Get(':personId')
  async findOne(@Param('personId') personId: string) {
    return await this.personService.findOne(personId);
  }

  @Get()
  @ApiOperation({
    summary: 'Получить всех персон',
    description: 'Возвращает список всех персон (актеров, режиссеров и т.д.)',
  })
  @ApiOkResponse({
    description: 'Персоны успешно получены',
  })
  @ApiBadRequestResponse({
    description: 'Невалидные параметры пагинации',
  })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('query') query?: string,
  ) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;

    return this.personService.findAll(pageNum, limitNum, query);
  }
}
