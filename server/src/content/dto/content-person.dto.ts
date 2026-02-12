import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
export class ContentPersonDto {
  @ApiProperty({ description: 'ID персоны' })
  @IsString()
  @IsNotEmpty({ message: 'ID персоны обязательно' })
  personId: string;

  @ApiProperty({ description: 'ID роли (актер, режиссер и т.д.)' })
  @IsString()
  @IsNotEmpty({ message: 'ID роли обязательно' })
  roleId: string;

  @ApiPropertyOptional({
    description: 'Название роли (если отличается от стандартного)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Название роли не должно превышать 100 символов' })
  roleName?: string;

  @ApiPropertyOptional({
    description: 'Важность роли (1-10, где 10 - самая важная)',
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Важность роли должна быть не менее 1' })
  @Max(10, { message: 'Важность роли не должна превышать 10' })
  @Type(() => Number)
  importance?: number = 1;
}
