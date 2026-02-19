import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { Authorization } from 'src/auth/decorators/authorization.decorator';
import { Authorized } from 'src/auth/decorators/authorized.decorator';
import { CreateCommentRatingDto } from './dto/create-comment-rating.dto';
import { CreateContentRatingDto } from './dto/create-content-rating.dto';
import { UpdateCommentRatingDto } from './dto/update-comment-rating.dto';
import { UpdateContentRatingDto } from './dto/update-content-rating.dto';
import { RatingsService } from './ratings.service';

@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Get('content/:contentId')
  async findAllRatingsInContent(@Param('contentId') contentId: string) {
    return await this.ratingsService.findAllRatingsInContent(contentId);
  }

  @Get('my/content')
  async findAllMyRatingsInContents(@Authorized('id') userId: string) {
    return await this.ratingsService.findAllUserRatingsInContents(userId);
  }

  @Get('user/:userId/content')
  async findAllUserRatingsInContents(@Param('userId') userId: string) {
    return await this.ratingsService.findAllUserRatingsInContents(userId);
  }

  @Post('content/:contentId')
  @Authorization()
  async rateContent(
    @Authorized('id') userId: string,
    @Param('contentId') contentId: string,
    @Body() dto: CreateContentRatingDto,
  ) {
    return await this.ratingsService.rateContent(userId, contentId, dto);
  }

  @Put('content/:contentId')
  @Authorization()
  async updateRateContent(
    @Authorized('id') userId: string,
    @Param('contentId') contentId: string,
    @Body() dto: UpdateContentRatingDto,
  ) {
    return await this.ratingsService.updateRateContent(userId, contentId, dto);
  }

  @Delete('content/:contentId')
  @Authorization()
  async removeRateContent(
    @Authorized('id') userId: string,
    @Param('contentId') contentId: string,
  ) {
    return await this.ratingsService.removeRateContent(userId, contentId);
  }

  @Get('comment/:commentId')
  async findAllRatingsInComment(@Param('commentId') commentId: string) {
    return await this.ratingsService.findAllRatingsInComment(commentId);
  }

  @Get('my/comment')
  async findAllMyRatingsInComments(@Authorized('id') userId: string) {
    return await this.ratingsService.findAllUserCommentRatingsInContents(
      userId,
    );
  }
  @Get('user/:userId/comment')
  async findAllUserRatingsInComments(@Param('userId') userId: string) {
    return await this.ratingsService.findAllUserCommentRatingsInContents(
      userId,
    );
  }

  @Post('comment/:commentId')
  @Authorization()
  async rateComment(
    @Authorized('id') userId: string,
    @Param('commentId') commentId: string,
    @Body() dto: CreateCommentRatingDto,
  ) {
    return await this.ratingsService.rateComment(userId, commentId, dto);
  }

  @Put('comment/:commentId')
  @Authorization()
  async updateRateComment(
    @Authorized('id') userId: string,
    @Param('commentId') commentId: string,
    @Body() dto: UpdateCommentRatingDto,
  ) {
    return await this.ratingsService.updateRateComment(userId, commentId, dto);
  }

  @Delete('comment/:commentId')
  @Authorization()
  async removeRateComment(
    @Authorized('id') userId: string,
    @Param('commentId') commentId: string,
  ) {
    return await this.ratingsService.removeRateComment(userId, commentId);
  }
}
