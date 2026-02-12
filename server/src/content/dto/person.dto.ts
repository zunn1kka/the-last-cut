import { IsNumber, IsOptional, IsString } from 'class-validator';

export class PersonDto {
  @IsString()
  personId: string;

  @IsString()
  roleId: string;

  @IsString()
  roleName: string;

  @IsNumber()
  @IsOptional()
  importance?: number;
}
