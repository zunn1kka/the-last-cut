import { Module } from '@nestjs/common';
import { WatchStatusService } from './watch-status.service';
import { WatchStatusController } from './watch-status.controller';

@Module({
  controllers: [WatchStatusController],
  providers: [WatchStatusService],
})
export class WatchStatusModule {}
