import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { EpisodeService } from './episode.service';

@ApiTags('episodes')
@Controller('episodes')
export class EpisodeController {
  constructor(private readonly episodeService: EpisodeService) {}

  @Get()
  @ApiOperation({ summary: 'Получить все эпизоды' })
  async findAll(@Query('seriesId') seriesId?: string) {
    return this.episodeService.findAll(seriesId);
  }

  @Get('series/:seriesId')
  @ApiOperation({ summary: 'Получить эпизоды по сериалу' })
  async findBySeries(@Param('seriesId') seriesId: string) {
    return this.episodeService.findBySeries(seriesId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить эпизод по ID' })
  async findOne(@Param('id') id: string) {
    return this.episodeService.findOne(id);
  }
}
