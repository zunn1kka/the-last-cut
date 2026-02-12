import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';

@Module({
  controllers: [CommentController],
  providers: [CommentService, JwtService],
})
export class CommentModule {}
