import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
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
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AdminOrModerator } from 'src/auth/decorators/admin-or-moderator.decorator';
import { AdminOnly } from 'src/auth/decorators/admin.decorator';
import { Authorized } from 'src/auth/decorators/authorized.decorator';
import { CreateMovieDto } from 'src/content/movie/dto/create-movie.dto';
import { UpdateMovieDto } from 'src/content/movie/dto/update-movie.dto';
import { CreateSeriesDto } from 'src/content/series/dto/create-series.dto';
import { UpdateSeriesDto } from 'src/content/series/dto/update-series.dto';
import { CreateEpisodeDto } from 'src/episode/dto/create-episode.dto';
import { UpdateEpisodeDto } from 'src/episode/dto/update-episode.dto';
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
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ========== УПРАВЛЕНИЕ КОММЕНТАРИЯМИ ==========

  @Get('comments')
  @AdminOrModerator()
  @ApiOperation({ summary: 'Получить все комментарии (админ/модератор)' })
  async getComments(
    @Query('status') status?: string,
    @Query('page') page?: number,
  ) {
    return await this.adminService.getComments(status, page);
  }

  @Get('comments/:id')
  @AdminOrModerator()
  @ApiOperation({ summary: 'Получить комментарий по ID (админ/модератор)' })
  @ApiParam({ name: 'id', description: 'UUID комментария' })
  async getCommentById(@Param('id') id: string) {
    return await this.adminService.getCommentById(id);
  }

  @Delete('comments/:id')
  @AdminOrModerator()
  @ApiOperation({ summary: 'Удалить комментарий (только админ)' })
  @ApiParam({ name: 'id', description: 'UUID комментария' })
  async deleteComment(
    @Param('id') id: string,
    @Authorized('id') adminId: string,
  ) {
    return await this.adminService.deleteComment(id, adminId);
  }

  // ========== УПРАВЛЕНИЕ ФИЛЬМАМИ ==========

  @Post('movies')
  @AdminOnly()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'poster', maxCount: 1 },
      { name: 'backdrop', maxCount: 1 },
    ]),
  )
  @ApiOperation({ summary: 'Создать новый фильм (только админ)' })
  @ApiConsumes('multipart/form-data')
  async createMovie(
    @Body() dto: CreateMovieDto,
    @UploadedFiles()
    files: { poster?: Express.Multer.File[]; backdrop?: Express.Multer.File[] },
    @Authorized('id') userId: string,
  ) {
    const poster = files?.poster?.[0];
    const backdrop = files?.backdrop?.[0];
    return this.adminService.createMovie(dto, poster, backdrop, userId);
  }

  @Put('movies/:contentId')
  @AdminOnly()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'poster', maxCount: 1 },
      { name: 'backdrop', maxCount: 1 },
    ]),
  )
  @ApiOperation({ summary: 'Обновить информацию о фильме (только админ)' })
  @ApiConsumes('multipart/form-data')
  async updateMovie(
    @Param('contentId') contentId: string,
    @Body() dto: UpdateMovieDto,
    @UploadedFiles()
    files: { poster?: Express.Multer.File[]; backdrop?: Express.Multer.File[] },
    @Authorized('id') userId: string,
  ) {
    const poster = files?.poster?.[0];
    const backdrop = files?.backdrop?.[0];
    return this.adminService.updateMovie(
      contentId,
      dto,
      poster,
      backdrop,
      userId,
    );
  }

  @Delete('movies/:contentId')
  @AdminOnly()
  @ApiOperation({ summary: 'Удалить фильм (только админ)' })
  async deleteMovie(
    @Param('contentId') contentId: string,
    @Authorized('id') userId: string,
  ) {
    return this.adminService.deleteMovie(contentId, userId);
  }

  // ========== УПРАВЛЕНИЕ СЕРИАЛАМИ ==========

  @Post('series')
  @AdminOnly()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'poster', maxCount: 1 },
      { name: 'backdrop', maxCount: 1 },
    ]),
  )
  @ApiOperation({ summary: 'Создать новый сериал (только админ)' })
  @ApiConsumes('multipart/form-data')
  async createSeries(
    @Body() dto: CreateSeriesDto,
    @UploadedFiles()
    files: { poster?: Express.Multer.File[]; backdrop?: Express.Multer.File[] },
    @Authorized('id') userId: string,
  ) {
    const poster = files?.poster?.[0];
    const backdrop = files?.backdrop?.[0];
    return this.adminService.createSeries(dto, poster, backdrop, userId);
  }

  @Put('series/:contentId')
  @AdminOnly()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'poster', maxCount: 1 },
      { name: 'backdrop', maxCount: 1 },
    ]),
  )
  @ApiOperation({ summary: 'Обновить информацию о сериале (только админ)' })
  @ApiConsumes('multipart/form-data')
  async updateSeries(
    @Param('contentId') contentId: string,
    @Body() dto: UpdateSeriesDto,
    @UploadedFiles()
    files: { poster?: Express.Multer.File[]; backdrop?: Express.Multer.File[] },
    @Authorized('id') userId: string,
  ) {
    const poster = files?.poster?.[0];
    const backdrop = files?.backdrop?.[0];
    return this.adminService.updateSeries(
      contentId,
      dto,
      poster,
      backdrop,
      userId,
    );
  }
  @Delete('series/:contentId')
  @AdminOnly()
  @ApiOperation({ summary: 'Удалить сериал (только админ)' })
  async deleteSeries(
    @Param('contentId') contentId: string,
    @Authorized('id') userId: string,
  ) {
    return this.adminService.deleteSeries(contentId, userId);
  }

  // ========== УПРАВЛЕНИЕ ЭПИЗОДАМИ ==========

  @Post('series/:seriesId/episodes')
  @AdminOnly()
  @ApiOperation({ summary: 'Создать эпизод для сериала (только админ)' })
  async createEpisode(
    @Param('seriesId') seriesId: string,
    @Body() dto: CreateEpisodeDto,
    @Authorized('id') userId: string,
  ) {
    return this.adminService.createEpisode(seriesId, dto, userId);
  }

  @Put('episodes/:episodeId')
  @AdminOnly()
  @ApiOperation({ summary: 'Обновить эпизод (только админ)' })
  async updateEpisode(
    @Param('episodeId') episodeId: string,
    @Body() dto: UpdateEpisodeDto,
    @Authorized('id') userId: string,
  ) {
    return this.adminService.updateEpisode(episodeId, dto, userId);
  }

  @Delete('episodes/:episodeId')
  @AdminOnly()
  @ApiOperation({ summary: 'Удалить эпизод (только админ)' })
  async deleteEpisode(
    @Param('episodeId') episodeId: string,
    @Authorized('id') userId: string,
  ) {
    return this.adminService.deleteEpisode(episodeId, userId);
  }

  // ========== УПРАВЛЕНИЕ ИЗОБРАЖЕНИЯМИ ==========

  @Post('content/:contentId/poster')
  @AdminOnly()
  @UseInterceptors(FileInterceptor('poster'))
  @ApiOperation({ summary: 'Загрузить постер для контента (только админ)' })
  @ApiConsumes('multipart/form-data')
  async uploadContentPoster(
    @Param('contentId') contentId: string,
    @UploadedFile() posterFile: Express.Multer.File,
    @Authorized('id') userId: string,
  ) {
    return this.adminService.uploadPoster(contentId, posterFile, userId);
  }

  @Post('content/:contentId/backdrop')
  @AdminOnly()
  @UseInterceptors(FileInterceptor('backdrop'))
  @ApiOperation({
    summary: 'Загрузить фоновое изображение для контента (только админ)',
  })
  @ApiConsumes('multipart/form-data')
  async uploadContentBackdrop(
    @Param('contentId') contentId: string,
    @UploadedFile() backdropFile: Express.Multer.File,
    @Authorized('id') userId: string,
  ) {
    return this.adminService.uploadBackdrop(contentId, backdropFile, userId);
  }

  @Post('content/:contentId/images')
  @AdminOnly()
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
  @AdminOnly()
  @ApiOperation({
    summary: 'Удалить контент (фильм или сериал) (только админ)',
  })
  async deleteContent(@Param('contentId') contentId: string) {
    return this.adminService.deleteContent(contentId);
  }

  // ========== УПРАВЛЕНИЕ ЖАНРАМИ ==========

  @Post('genres')
  @AdminOnly()
  @ApiOperation({ summary: 'Создать новый жанр (только админ)' })
  async createGenre(
    @Body() dto: CreateGenreDto,
    @Authorized('id') userId: string,
  ) {
    return this.adminService.createGenre(userId, dto);
  }

  @Put('genres/:genreId')
  @AdminOnly()
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
  @AdminOnly()
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
  @AdminOnly()
  @UseInterceptors(FileInterceptor('personPhoto'))
  @ApiOperation({ summary: 'Создать новую персону (только админ)' })
  @ApiConsumes('multipart/form-data')
  async createPerson(
    @Body() dto: CreatePersonDto,
    @UploadedFile() personPhoto: Express.Multer.File,
    @Authorized('id') userId: string,
  ) {
    return this.adminService.createPerson(userId, dto, personPhoto);
  }

  @Put('persons/:personId')
  @AdminOnly()
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
  @AdminOnly()
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
  @AdminOnly()
  @ApiOperation({ summary: 'Создать новую роль для персон (только админ)' })
  async createPersonRole(
    @Body() dto: CreatePersonRoleDto,
    @Authorized('id') userId: string,
  ) {
    return this.adminService.createPersonRole(userId, dto);
  }

  @Put('person-roles/:roleId')
  @AdminOnly()
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
  @AdminOnly()
  @ApiOperation({ summary: 'Удалить роль персоны (только админ)' })
  @ApiParam({ name: 'roleId', description: 'UUID роли' })
  async deletePersonRole(
    @Param('roleId') roleId: string,
    @Authorized('id') userId: string,
  ) {
    return this.adminService.deletePersonRole(userId, roleId);
  }

  // ========== УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ ==========

  @Get('users')
  @AdminOnly()
  @ApiOperation({ summary: 'Получить всех пользователей (только админ)' })
  async getUsers() {
    return await this.adminService.getUsers();
  }

  @Get('users/:id')
  @AdminOnly()
  @ApiOperation({ summary: 'Получить пользователя по ID (только админ)' })
  @ApiParam({ name: 'id', description: 'UUID пользователя' })
  async getUserById(@Param('id') id: string) {
    return await this.adminService.getUserById(id);
  }

  @Patch('users/:id/role')
  @AdminOnly()
  @ApiOperation({ summary: 'Изменить роль пользователя (только админ)' })
  @ApiParam({ name: 'id', description: 'UUID пользователя' })
  async updateUserRole(
    @Param('id') id: string,
    @Body('role') role: string,
    @Authorized('id') adminId: string,
  ) {
    return await this.adminService.updateUserRole(id, role, adminId);
  }

  @Delete('users/:id')
  @AdminOnly()
  @ApiOperation({ summary: 'Удалить пользователя (только админ)' })
  @ApiParam({ name: 'id', description: 'UUID пользователя' })
  async deleteUser(@Param('id') id: string, @Authorized('id') adminId: string) {
    return await this.adminService.deleteUser(id, adminId);
  }

  // ========== УПРАВЛЕНИЕ ЖАЛОБАМИ ==========

  @Get('reports')
  @AdminOrModerator()
  @ApiOperation({ summary: 'Получить все жалобы (админ/модератор)' })
  async getReports() {
    return await this.adminService.getReports();
  }

  @Patch('reports/:id/resolve')
  @AdminOrModerator()
  @ApiOperation({ summary: 'Решить жалобу (админ/модератор)' })
  @ApiParam({ name: 'id', description: 'UUID жалобы' })
  async resolveReport(@Param('id') id: string) {
    return await this.adminService.resolveReport(id);
  }

  @Patch('reports/:id/reject')
  @AdminOrModerator()
  @ApiOperation({ summary: 'Отклонить жалобу (админ/модератор)' })
  @ApiParam({ name: 'id', description: 'UUID жалобы' })
  async rejectReport(@Param('id') id: string) {
    return await this.adminService.rejectReport(id);
  }
}
