import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Put,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdminOnly } from 'src/auth/decorators/admin.decorator';
import { Authorized } from 'src/auth/decorators/authorized.decorator';
import { CreateMovieDto } from 'src/content/movie/dto/create-movie.dto';
import { UpdateMovieDto } from 'src/content/movie/dto/update-movie.dto';
import { CreateSeriesDto } from 'src/content/series/dto/create-series.dto';
import { UpdateSeriesDto } from 'src/content/series/dto/update-series.dto';
import { CreateGenreDto } from 'src/genre/dto/create-genre.dto';
import { UpdateGenreDto } from 'src/genre/dto/update-genre.dto';
import { CreatePersonRoleDto } from 'src/person-role/dto/create-person-role.dto';
import { UpdatePersonRoleDto } from 'src/person-role/dto/update-person-role.dto';
import { CreatePersonDto } from 'src/person/dto/create-person.dto';
import { UpdatePersonDto } from 'src/person/dto/update-person.dto';
import { AdminService } from './admin.service';

@ApiTags('admin')
@ApiBearerAuth('JWT-auth')
@Controller('admin')
@AdminOnly()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ========== УПРАВЛЕНИЕ ФИЛЬМАМИ ==========

  @Post('movies')
  @ApiOperation({ summary: 'Создать новый фильм (только админ)' })
  @ApiResponse({ status: 201, description: 'Фильм успешно создан' })
  @ApiResponse({
    status: 409,
    description: 'Фильм с таким названием уже существует',
  })
  async createMovie(
    @Body() dto: CreateMovieDto,
    @Authorized('id') userId: string,
  ) {
    return this.adminService.createMovie(dto, userId);
  }

  @Put('movies/:contentId')
  @ApiOperation({ summary: 'Обновить информацию о фильме (только админ)' })
  @ApiParam({ name: 'contentId', description: 'UUID фильма' })
  @ApiResponse({ status: 200, description: 'Фильм успешно обновлен' })
  @ApiResponse({ status: 404, description: 'Фильм не найден' })
  @ApiResponse({
    status: 409,
    description: 'Фильм с таким названием уже существует',
  })
  async updateMovie(
    @Param('contentId') contentId: string,
    @Body() dto: UpdateMovieDto,
    @Authorized('id') userId: string,
  ) {
    return this.adminService.updateMovie(contentId, dto, userId);
  }

  @Delete('movies/:contentId')
  @ApiOperation({ summary: 'Удалить фильм (только админ)' })
  @ApiParam({ name: 'contentId', description: 'UUID фильма' })
  @ApiResponse({ status: 200, description: 'Фильм успешно удален' })
  @ApiResponse({ status: 404, description: 'Фильм не найден' })
  async deleteMovie(
    @Param('contentId') contentId: string,
    @Authorized('id') userId: string,
  ) {
    return this.adminService.deleteMovie(contentId, userId);
  }

  // ========== УПРАВЛЕНИЕ СЕРИАЛАМИ ==========

  @Post('series')
  @ApiOperation({ summary: 'Создать новый сериал (только админ)' })
  @ApiResponse({ status: 201, description: 'Сериал успешно создан' })
  @ApiResponse({
    status: 409,
    description: 'Сериал с таким названием уже существует',
  })
  async createSeries(
    @Body() dto: CreateSeriesDto,
    @Authorized('id') userId: string,
  ) {
    return this.adminService.createSeries(dto, userId);
  }

  @Put('series/:contentId')
  @ApiOperation({ summary: 'Обновить информацию о сериале (только админ)' })
  @ApiParam({ name: 'contentId', description: 'UUID сериала' })
  @ApiResponse({ status: 200, description: 'Сериал успешно обновлен' })
  @ApiResponse({ status: 404, description: 'Сериал не найден' })
  async updateSeries(
    @Param('contentId') contentId: string,
    @Body() dto: UpdateSeriesDto,
    @Authorized('id') userId: string,
  ) {
    return this.adminService.updateSeries(contentId, dto, userId);
  }

  @Delete('series/:contentId')
  @ApiOperation({ summary: 'Удалить сериал (только админ)' })
  @ApiParam({ name: 'contentId', description: 'UUID сериала' })
  @ApiResponse({ status: 200, description: 'Сериал успешно удален' })
  @ApiResponse({ status: 404, description: 'Сериал не найден' })
  async deleteSeries(
    @Param('contentId') contentId: string,
    @Authorized('id') userId: string,
  ) {
    return this.adminService.deleteSeries(contentId, userId);
  }

  // ========== УПРАВЛЕНИЕ ИЗОБРАЖЕНИЯМИ ==========

  @Post('content/:contentId/poster')
  @UseInterceptors(FileInterceptor('poster'))
  @ApiOperation({
    summary: 'Загрузить постер для контента (фильм или сериал) (только админ)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'contentId', description: 'UUID контента' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        poster: {
          type: 'string',
          format: 'binary',
          description: 'Файл постера (jpg, png, webp)',
        },
      },
    },
  })
  async uploadContentPoster(
    @Param('contentId') contentId: string,
    @UploadedFile() posterFile: Express.Multer.File,
    @Authorized('id') userId: string,
  ) {
    return this.adminService.uploadPoster(contentId, posterFile, userId);
  }

  @Post('content/:contentId/backdrop')
  @UseInterceptors(FileInterceptor('backdrop'))
  @ApiOperation({
    summary: 'Загрузить фоновое изображение для контента (только админ)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'contentId', description: 'UUID контента' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        backdrop: {
          type: 'string',
          format: 'binary',
          description: 'Файл фонового изображения',
        },
      },
    },
  })
  async uploadContentBackdrop(
    @Param('contentId') contentId: string,
    @UploadedFile() backdropFile: Express.Multer.File,
    @Authorized('id') userId: string,
  ) {
    return this.adminService.uploadBackdrop(contentId, backdropFile, userId);
  }

  @Post('content/:contentId/images')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'poster', maxCount: 1 },
      { name: 'backdrop', maxCount: 1 },
    ]),
  )
  @ApiOperation({
    summary: 'Загрузить несколько изображений для контента (только админ)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'contentId', description: 'UUID контента' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        poster: {
          type: 'string',
          format: 'binary',
          description: 'Файл постера',
        },
        backdrop: {
          type: 'string',
          format: 'binary',
          description: 'Файл фонового изображения',
        },
      },
    },
  })
  async uploadContentImages(
    @Param('contentId') contentId: string,
    @Authorized('id') userId: string,
    @UploadedFiles()
    files?: {
      poster?: Express.Multer.File[];
      backdrop?: Express.Multer.File[];
    },
  ) {
    const poster = files?.poster?.[0];
    const backdrop = files?.backdrop?.[0];
    return this.adminService.uploadImages(contentId, userId, poster, backdrop);
  }

  @Delete('content/:contentId')
  @ApiOperation({
    summary: 'Удалить контент (фильм или сериал) (только админ)',
  })
  @ApiParam({ name: 'contentId', description: 'UUID контента' })
  async deleteContent(@Param('contentId') contentId: string) {
    return this.adminService.deleteContent(contentId);
  }

  // ========== УПРАВЛЕНИЕ ЖАНРАМИ ==========

  @Post('genres')
  @ApiOperation({ summary: 'Создать новый жанр (только админ)' })
  async createGenre(
    @Body() dto: CreateGenreDto,
    @Authorized('id') userId: string,
  ) {
    return this.adminService.createGenre(userId, dto);
  }

  @Put('genres/:genreId')
  @ApiOperation({ summary: 'Обновить жанр (только админ)' })
  @ApiParam({ name: 'genreId', description: 'UUID жанра' })
  async updateGenre(
    @Param('genreId') genreId: string,
    @Body() dto: UpdateGenreDto,
    @Authorized('id') userId: string,
  ) {
    return this.adminService.updateGenre(userId, genreId, dto);
  }

  @Delete('genres/:genreId')
  @ApiOperation({ summary: 'Удалить жанр (только админ)' })
  @ApiParam({ name: 'genreId', description: 'UUID жанра' })
  async deleteGenre(
    @Param('genreId') genreId: string,
    @Authorized('id') userId: string,
  ) {
    return this.adminService.deleteGenre(userId, genreId);
  }

  // ========== УПРАВЛЕНИЕ ПЕРСОНАМИ ==========

  @Post('persons')
  @UseInterceptors(FileInterceptor('personPhoto'))
  @ApiOperation({
    summary: 'Создать новую персону (актера, режиссера) (только админ)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        fullname: { type: 'string' },
        biography: { type: 'string' },
        birthDate: { type: 'string', format: 'date' },
        deathDate: { type: 'string', format: 'date', nullable: true },
        personPhoto: {
          type: 'string',
          format: 'binary',
          description: 'Фото персоны',
        },
      },
    },
  })
  async createPerson(
    @Body() dto: CreatePersonDto,
    @UploadedFile() personPhoto: Express.Multer.File,
    @Authorized('id') userId: string,
  ) {
    return this.adminService.createPerson(userId, dto, personPhoto);
  }

  @Put('persons/:personId')
  @UseInterceptors(FileInterceptor('personPhoto'))
  @ApiOperation({ summary: 'Обновить информацию о персоне (только админ)' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'personId', description: 'UUID персоны' })
  async updatePerson(
    @Param('personId') personId: string,
    @Body() dto: UpdatePersonDto,
    @UploadedFile() personPhoto: Express.Multer.File,
    @Authorized('id') userId: string,
  ) {
    return this.adminService.updatePerson(userId, personId, dto, personPhoto);
  }

  @Delete('persons/:personId')
  @ApiOperation({ summary: 'Удалить персону (только админ)' })
  @ApiParam({ name: 'personId', description: 'UUID персоны' })
  async deletePerson(
    @Param('personId') personId: string,
    @Authorized('id') userId: string,
  ) {
    return this.adminService.deletePerson(userId, personId);
  }

  // ========== УПРАВЛЕНИЕ РОЛЯМИ ПЕРСОН ==========

  @Post('person-roles')
  @ApiOperation({ summary: 'Создать новую роль для персон (только админ)' })
  async createPersonRole(
    @Body() dto: CreatePersonRoleDto,
    @Authorized('id') userId: string,
  ) {
    return this.adminService.createPersonRole(userId, dto);
  }

  @Put('person-roles/:roleId')
  @ApiOperation({ summary: 'Обновить роль персоны (только админ)' })
  @ApiParam({ name: 'roleId', description: 'UUID роли' })
  async updatePersonRole(
    @Param('roleId') roleId: string,
    @Body() dto: UpdatePersonRoleDto,
    @Authorized('id') userId: string,
  ) {
    return this.adminService.updatePersonRole(userId, roleId, dto);
  }

  @Delete('person-roles/:roleId')
  @ApiOperation({ summary: 'Удалить роль персоны (только админ)' })
  @ApiParam({ name: 'roleId', description: 'UUID роли' })
  async deletePersonRole(
    @Param('roleId') roleId: string,
    @Authorized('id') userId: string,
  ) {
    return this.adminService.deletePersonRole(userId, roleId);
  }
}
