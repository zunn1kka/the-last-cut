import { IsBoolean } from 'class-validator';

export class CreateCommentRatingDto {
  @IsBoolean()
  isPositive: boolean;
}
