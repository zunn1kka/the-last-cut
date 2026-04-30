import { Module } from '@nestjs/common';
import { NotificationsService } from 'src/notifications/notifications.service';
import { RatingsController } from './ratings.controller';
import { RatingsService } from './ratings.service';

@Module({
  controllers: [RatingsController],
  providers: [RatingsService, NotificationsService],
})
export class RatingsModule {}
