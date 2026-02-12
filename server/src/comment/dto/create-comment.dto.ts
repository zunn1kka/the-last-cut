import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    description: 'Текст комментария',
    example: 'Отличный фильм! Особенно понравилась концовка.',
    minLength: 1,
    maxLength: 2000,
  })
  @IsString({ message: 'Текст комментария должен быть строкой' })
  @IsNotEmpty({ message: 'Текст комментария не должен быть пустым' })
  text: string;

  @ApiPropertyOptional({
    description: 'Рейтинг фильма от 1 до 10',
    example: 9,
    minimum: 1,
    maximum: 10,
    nullable: true,
  })
  @IsNumber({}, { message: 'Рейтинг должен быть числом' })
  rating: number;

  @ApiPropertyOptional({
    description: 'UUID родительского комментария (если это ответ)',
    example: '550e8400-e29b-41d4-a716-446655440001',
    nullable: true,
  })
  @IsUUID()
  @IsOptional()
  parentId: string;
}
