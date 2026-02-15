import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  Validate,
} from 'class-validator';
import { IsChangePasswordsMatchingConstraint } from 'src/lib/common/decorators/is-change-passwords-matching-constraint.decorator';

export class UpdatePasswordDto {
  @ApiProperty({
    description: 'Текущий пароль',
    example: 'OldPassword123',
  })
  @IsString({ message: 'Текущий пароль должен быть строкой' })
  @IsNotEmpty({ message: 'Текущий пароль обязателен' })
  currentPassword: string;

  @ApiProperty({
    description: 'Новый пароль',
    example: 'NewPassword123',
    minLength: 8,
    maxLength: 32,
  })
  @IsString({ message: 'Новый пароль должен быть строкой' })
  @IsNotEmpty({ message: 'Новый пароль обязателен' })
  @MinLength(8, { message: 'Новый пароль должен содержать минимум 8 символов' })
  @MaxLength(32, { message: 'Новый пароль не должен превышать 32 символа' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'Новый пароль должен содержать хотя бы одну заглавную букву, одну строчную букву и одну цифру',
  })
  newPassword: string;

  @ApiProperty({
    description: 'Подтверждение нового пароля',
    example: 'NewPassword123',
  })
  @IsString({ message: 'Подтверждение пароля должно быть строкой' })
  @IsNotEmpty({ message: 'Подтверждение пароля обязательно' })
  @Validate(IsChangePasswordsMatchingConstraint, {
    message: 'Пароли не совпадают',
  })
  confirmPassword: string;
}
