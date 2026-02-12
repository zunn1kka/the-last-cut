import { Module } from '@nestjs/common';
import { FileService } from 'src/file/file.service';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { MovieService } from './movie/movie.service';
import { SeriesService } from './series/series.service';

@Module({
  controllers: [ContentController],
  providers: [ContentService, MovieService, SeriesService, FileService],
  exports: [ContentService, MovieService, SeriesService],
})
export class ContentModule {}
