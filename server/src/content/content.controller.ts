import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ContentService } from './content.service';
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
}
