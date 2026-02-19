import { IsNumber } from 'class-validator';

export class CreateContentRatingDto {
  @IsNumber({}, { message: 'Рейтинг должен быть строкой' })
  rating: number;
}
