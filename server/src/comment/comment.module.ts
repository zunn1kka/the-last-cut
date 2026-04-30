import { Module } from '@nestjs/common';
import { NotificationsService } from 'src/notifications/notifications.service';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';

@Module({
  controllers: [CommentController],
  providers: [CommentService, NotificationsService],
})
export class CommentModule {}
