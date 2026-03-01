import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Authorization } from 'src/auth/decorators/authorization.decorator';
import { PersonService } from './person.service';

@Authorization()
@ApiTags('persons')
@ApiBearerAuth('JWT-auth')
@Controller('persons')
export class PersonController {
  constructor(private readonly personService: PersonService) {}

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
  async findAll() {
    return await this.personService.findAll();
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

  @Get('search')
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
  async search(@Query('query') query: string) {
    return await this.personService.search(query);
  }
}
