import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  Validate,
} from 'class-validator';
import { UserRole } from 'generated/prisma/enums';
import { IsPasswordsMatchingRegisterConstraint } from 'src/lib/common/decorators/is-passwords-matching-register-constraint.decorator';

export class RegisterDto {
  @ApiProperty({
    description: 'Имя пользователя',
    example: 'Username',
  })
  @IsString({ message: 'Имя пользователя должно быть строкой' })
  @IsNotEmpty({ message: 'Имя пользователя обязательно для заполнения' })
  @MinLength(3, {
    message: 'Имя пользователя должно содержать минимум 3 символа',
  })
  @MaxLength(50, {
    message: 'Имя пользователя не должно превышать 50 символов',
  })
  @Matches(/^[a-zA-Z]/, {
    message: 'Имя пользователя должно начинаться с буквы',
  })
  username: string;

  @ApiProperty({
    description: 'Электронная почта пользователя',
    example: 'example@yandex.ru',
  })
  @IsEmail({}, { message: 'Некорректный формат электронной почты' })
  @IsNotEmpty({ message: 'Электронная почта обязательна для заполнения' })
  email: string;

  @ApiProperty({
    description: 'ID телеграмма пользователя',
    example: '@sjso2',
  })
  @IsString({ message: 'Telegram ID должен быть строкой' })
  @IsOptional()
  @Matches(/^@[a-zA-Z0-9_]{5,32}$/, {
    message:
      'Telegram ID должен начинаться с @ и содержать 5-32 символа (буквы, цифры, подчеркивание)',
  })
  telegramId?: string;

  @ApiProperty({
    description: 'Пароль пользователя',
    example: 'Lastcut100',
    minLength: 8,
    maxLength: 32,
  })
  @IsString({ message: 'Пароль должен быть строкой' })
  @IsNotEmpty({ message: 'Пароль обязателен для заполнения' })
  @MinLength(8, { message: 'Пароль должен содержать минимум 8 символов' })
  @MaxLength(32, { message: 'Пароль не должен превышать 32 символа' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'Пароль должен содержать хотя бы одну заглавную букву, одну строчную букву и одну цифру',
  })
  @Matches(/^[a-zA-Z\d@$!%*?&]+$/, {
    message:
      'Пароль может содержать только буквы, цифры и специальные символы (@$!%*?&)',
  })
  password: string;

  @ApiProperty({
    description: 'Пароль пользователя',
    example: 'Lastcut100',
    minLength: 8,
    maxLength: 32,
  })
  @IsString({ message: 'Подтверждение пароля должно быть строкой' })
  @IsNotEmpty({ message: 'Подтверждение пароля обязательно' })
  @Validate(IsPasswordsMatchingRegisterConstraint, {
    message: 'Пароли не совпадают',
  })
  confirmPassword: string;

  @ApiProperty({
    description: 'Роль пользователя',
    example: 'USER',
  })
  role?: UserRole = UserRole.USER;
}
