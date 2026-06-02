import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ContentService } from './content.service';
import { FindAllContentDto } from './dto/find-all-content.dto';
import { MovieService } from './movie/movie.service';
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
  @ApiOperation({ summary: 'Получение всего контента с фильтрацией' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Номер страницы',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Количество на странице',
  })
  @ApiQuery({
    name: 'contentType',
    required: false,
    enum: ['MOVIE', 'SERIES'],
    description: 'Тип контента',
  })
  @ApiQuery({
    name: 'genreIds',
    required: false,
    type: [String],
    description: 'ID жанров через запятую',
  })
  @ApiQuery({
    name: 'yearFrom',
    required: false,
    type: Number,
    description: 'Год от',
  })
  @ApiQuery({
    name: 'yearTo',
    required: false,
    type: Number,
    description: 'Год до',
  })
  @ApiQuery({
    name: 'ratingFrom',
    required: false,
    type: Number,
    description: 'Рейтинг от',
  })
  @ApiQuery({
    name: 'ratingTo',
    required: false,
    type: Number,
    description: 'Рейтинг до',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: [
      'title',
      'releaseYear',
      'createdAt',
      'updatedAt',
      'siteRating',
      'imdbRating',
      'kinopoiskRating',
    ],
    description: 'Поле для сортировки',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Порядок сортировки',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Поисковый запрос',
  })
  async findAll(@Query() query: FindAllContentDto) {
    return this.contentService.findAll(query);
  }

  @Get('/series')
  async findAllSeries() {
    return await this.seriesService.findAll();
  }
  @Get('/series/777s')
  async findAllSeriess() {
    return await this.seriesService.findAll();
  }

  @Get('/series/:seriesId')
  async findOneSeries(@Param('seriesId') seriesId: string) {
    return await this.seriesService.findOne(seriesId);
  }

  @Get('/movies')
  async findAllMovie() {
    return await this.movieService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получение контента по ID (фильм или сериал)' })
  async findOne(@Param('id') id: string) {
    return this.contentService.findOne(id);
  }

  @Get('movies/:movieId')
  @ApiOperation({ summary: 'Получить фильм по ID' })
  @ApiParam({ name: 'movieId', description: 'UUID фильма' })
  @ApiResponse({ status: 200, description: 'Фильм найден' })
  @ApiResponse({ status: 404, description: 'Фильм не найден' })
  async findOneMovie(@Param('movieId') movieId: string) {
    return await this.movieService.findOne(movieId);
  }
}
