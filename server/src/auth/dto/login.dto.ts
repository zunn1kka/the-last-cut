import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Электронная почта пользователя',
    example: 'example@yandex.ru',
  })
  @IsEmail({}, { message: 'Некорректный формат электронной почты' })
  @IsNotEmpty({ message: 'Электронная почта обязательна для заполнения' })
  email: string;

  @ApiProperty({
    description: 'Пароль пользователя',
    example: 'Lastcut100',
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
}
