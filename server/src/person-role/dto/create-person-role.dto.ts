import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreatePersonRoleDto {
  @ApiProperty({
    description: 'Название роли',
    example: 'Рик Далтон',
    minLength: 10,
    maxLength: 40,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  name: string;
}
