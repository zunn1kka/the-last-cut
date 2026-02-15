import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
import { AdminOnly } from 'src/auth/decorators/admin.decorator';
import { Authorization } from 'src/auth/decorators/authorization.decorator';
import { Authorized } from 'src/auth/decorators/authorized.decorator';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
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

  @Post()
  @AdminOnly()
  @UseInterceptors(FileInterceptor('photoUrl'))
  @ApiOperation({
    summary: 'Создать персону',
    description:
      'Создает новую персону (актера, режиссера и т.д.). Только для администраторов.',
  })
  @ApiCreatedResponse({
    description: 'Персона успешно создана',
  })
  @ApiUnauthorizedResponse({
    description: 'Пользователь не авторизован',
  })
  @ApiForbiddenResponse({
    description: 'Недостаточно прав (требуется роль ADMIN)',
  })
  @ApiBadRequestResponse({
    description: 'Невалидные данные или файл',
  })
  @ApiConflictResponse({
    description: 'Персона с таким именем уже существует',
  })
  async create(
    @Authorized('id') userId: string,
    @Body() dto: CreatePersonDto,
    @UploadedFile() personPhoto: Express.Multer.File,
  ) {
    return await this.personService.create(userId, dto, personPhoto);
  }

  @Put(':personId')
  @AdminOnly()
  @UseInterceptors(FileInterceptor('photoUrl'))
  @ApiOperation({
    summary: 'Обновить персону',
    description: 'Обновляет информацию о персоне. Только для администраторов',
  })
  @ApiParam({
    name: 'personId',
    description: 'UUID идентификатор персоны',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    description: 'Данные для обновления персоны',
    type: UpdatePersonDto,
  })
  @ApiOkResponse({
    description: 'Персона успешно обновлена',
  })
  @ApiUnauthorizedResponse({
    description: 'Пользователь не авторизован',
  })
  @ApiForbiddenResponse({
    description: 'Недостаточно прав (требуется роль ADMIN)',
  })
  @ApiNotFoundResponse({
    description: 'Персона с указанным ID не найдена',
  })
  @ApiBadRequestResponse({
    description: 'Невалидные данные, файл или ID',
  })
  @ApiConflictResponse({
    description: 'Персона с таким именем уже существует',
  })
  async update(
    @Authorized('id') userId: string,
    @Param('personId')
    personId: string,
    @Body()
    dto: UpdatePersonDto,
    @UploadedFile() personPhoto: Express.Multer.File,
  ) {
    return await this.personService.update(userId, personId, dto, personPhoto);
  }

  @Delete(':personId')
  @AdminOnly()
  @ApiOperation({
    summary: 'Удалить персону',
    description: 'Удаляет персону по ID. Только для администраторов.',
  })
  @ApiParam({
    name: 'personId',
    description: 'UUID идентификатор персоны',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    description: 'Персона успешно удалена',
  })
  @ApiUnauthorizedResponse({
    description: 'Пользователь не авторизован',
  })
  @ApiForbiddenResponse({
    description: 'Недостаточно прав (требуется роль ADMIN)',
  })
  @ApiNotFoundResponse({
    description: 'Персона с указанным ID не найдена',
  })
  @ApiBadRequestResponse({
    description: 'Невалидный UUID идентификатор',
  })
  @ApiConflictResponse({
    description: 'Невозможно удалить персону, так как она связана с фильмами',
  })
  async delete(
    @Authorized('id') userId: string,
    @Param('personId') personId: string,
  ) {
    return await this.personService.delete(userId, personId);
  }
}
