import { PartialType } from '@nestjs/swagger';
import { CreateContentRatingDto } from './create-content-rating.dto';

export class UpdateContentRatingDto extends PartialType(
  CreateContentRatingDto,
) {}
