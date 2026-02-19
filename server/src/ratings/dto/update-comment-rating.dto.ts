import { PartialType } from '@nestjs/swagger';
import { CreateCommentRatingDto } from './create-comment-rating.dto';

export class UpdateCommentRatingDto extends PartialType(
  CreateCommentRatingDto,
) {}
