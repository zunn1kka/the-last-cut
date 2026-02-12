import {
  Body,
  Controller,
  Delete,
  Get,
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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminOnly } from 'src/auth/decorators/admin.decorator';
import { Authorized } from 'src/auth/decorators/authorized.decorator';
import { ContentService } from './content.service';
import { CreateMovieDto } from './movie/dto/create-movie.dto';
import { UpdateMovieDto } from './movie/dto/update-movie.dto';
import { MovieService } from './movie/movie.service';
import { CreateSeriesDto } from './series/dto/create-series.dto';
import { UpdateSeriesDto } from './series/dto/update-series.dto';
import { SeriesService } from './series/series.service';

@Controller('content')
@ApiTags('content')
@ApiBearerAuth('JWT-auth')
export class ContentController {
  constructor(
    private readonly contentService: ContentService,
    private readonly movieService: MovieService,
    private readonly seriesService: SeriesService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Получение всего контента' })
  async findAll() {
    return this.contentService.findAll();
  }

  // @Get('search')
  // @ApiOperation({ summary: 'Search content' })
  // async search(@Query('q') query: string) {
  //   return this.contentService.search(query);
  // }

  @Get(':id')
  @ApiOperation({ summary: 'Получение контента по ID (фильм или сериал)' })
  async findOne(@Param('id') id: string) {
    return this.contentService.findOne(id);
  }

  @Delete(':id')
  @AdminOnly()
  @ApiOperation({ summary: 'Удаление контента (фильм или сериал)' })
  async delete(@Param('id') id: string) {
    return this.contentService.delete(id);
  }

  @Post('movies')
  @AdminOnly()
  @ApiOperation({ summary: 'Создание фильма' })
  async createMovie(
    @Body() dto: CreateMovieDto,
    @Authorized('id') userId: string,
  ) {
    return this.movieService.create(dto, userId);
  }

  @Put('movies/:id')
  @AdminOnly()
  @ApiOperation({ summary: 'Обновление фильма' })
  async updateMovie(
    @Param('id') id: string,
    @Body() dto: UpdateMovieDto,
    @Authorized('id') userId: string,
  ) {
    return this.movieService.update(id, dto, userId);
  }

  @Put('movies/:id/images')
  @AdminOnly()
  @ApiOperation({ summary: 'Загрузка/Обновление изображений фильма' })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'poster', maxCount: 1 },
      { name: 'backdrop', maxCount: 1 },
    ]),
  )
  async uploadMovieImages(
    @Param('id') id: string,
    @Authorized('id') userId: string,
    @UploadedFiles()
    files?: {
      poster?: Express.Multer.File[];
      backdrop?: Express.Multer.File[];
    },
  ) {
    const poster = files?.poster?.[0];
    const backdrop = files?.backdrop?.[0];
    return this.movieService.uploadImages(id, userId, poster, backdrop);
  }

  @Put('movies/:id/poster')
  @AdminOnly()
  @ApiOperation({ summary: 'Загрузка/Обновление постера фильма' })
  @UseInterceptors(FileInterceptor('poster'))
  async uploadMoviePoster(
    @Param('id') id: string,
    @UploadedFile() posterFile: Express.Multer.File,
    @Authorized('id') userId: string,
  ) {
    return this.movieService.uploadPoster(id, posterFile, userId);
  }

  @Put('movies/:id/backdrop')
  @AdminOnly()
  @ApiOperation({ summary: 'Загрузка/Обновление фонового изображения фильма' })
  @UseInterceptors(FileInterceptor('backdrop'))
  async uploadMovieBackdrop(
    @Param('id') id: string,
    @UploadedFile() backdropFile: Express.Multer.File,
    @Authorized('id') userId: string,
  ) {
    return this.movieService.uploadBackdrop(id, backdropFile, userId);
  }

  @Delete('movies/:id')
  @ApiOperation({ summary: 'Удаление фильма' })
  @AdminOnly()
  async deleteMovie(@Param('id') id: string, @Authorized('id') userId: string) {
    return this.movieService.delete(id, userId);
  }

  @Post('series')
  @AdminOnly()
  @ApiOperation({ summary: 'Создание нового сериала' })
  async createSeries(
    @Body() dto: CreateSeriesDto,
    @Authorized('id') userId: string,
  ) {
    return this.seriesService.create(dto, userId);
  }

  @Put('series/:id')
  @AdminOnly()
  @ApiOperation({ summary: 'Обновление сериала' })
  async updateSeries(
    @Param('id') id: string,
    @Body() dto: UpdateSeriesDto,
    @Authorized('id') userId: string,
  ) {
    return this.seriesService.update(id, dto, userId);
  }

  @Put('series/:id/images')
  @AdminOnly()
  @ApiOperation({ summary: 'Загрузка/Обновление изображений сериала' })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'poster', maxCount: 1 },
      { name: 'backdrop', maxCount: 1 },
    ]),
  )
  async uploadSeriesImages(
    @Param('id') id: string,
    @Authorized('id') userId: string,
    @UploadedFiles()
    files?: {
      poster?: Express.Multer.File[];
      backdrop?: Express.Multer.File[];
    },
  ) {
    const poster = files?.poster?.[0];
    const backdrop = files?.backdrop?.[0];
    return this.seriesService.uploadImages(id, userId, poster, backdrop);
  }

  @Put('series/:id/poster')
  @AdminOnly()
  @ApiOperation({ summary: 'Загрузка/Обновление постера сериала' })
  @UseInterceptors(FileInterceptor('poster'))
  async uploadSeriesPoster(
    @Param('id') id: string,
    @UploadedFile() posterFile: Express.Multer.File,
    @Authorized('id') userId: string,
  ) {
    return this.seriesService.uploadPoster(id, posterFile, userId);
  }

  @Put('series/:id/backdrop')
  @AdminOnly()
  @ApiOperation({ summary: 'Загрузка/Обновление фонового изображения сериала' })
  @UseInterceptors(FileInterceptor('backdrop'))
  async uploadSeriesBackdrop(
    @Param('id') id: string,
    @UploadedFile() backdropFile: Express.Multer.File,
    @Authorized('id') userId: string,
  ) {
    return this.seriesService.uploadBackdrop(id, backdropFile, userId);
  }

  @Delete('movies/:id')
  @ApiOperation({ summary: 'Удаление фильма' })
  @AdminOnly()
  async deleteSerial(
    @Param('id') id: string,
    @Authorized('id') userId: string,
  ) {
    return this.seriesService.delete(id, userId);
  }
}
