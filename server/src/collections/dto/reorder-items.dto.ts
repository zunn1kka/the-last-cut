import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsString, ValidateNested } from 'class-validator';

class ReorderItemDto {
  @ApiProperty({ description: 'ID элемента в сборнике' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Новый порядок (индекс)' })
  @IsInt()
  order: number;
}

export class ReorderItemsDto {
  @ApiProperty({
    type: [ReorderItemDto],
    description: 'Массив элементов с новым порядком',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderItemDto)
  items: ReorderItemDto[];
}
