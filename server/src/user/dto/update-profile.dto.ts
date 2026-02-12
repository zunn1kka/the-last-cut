import {
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString({ message: 'Имя пользователя должно быть строкой' })
  @MinLength(3, {
    message: 'Имя пользователя должно содержать минимум 3 символа',
  })
  @MaxLength(50, {
    message: 'Имя пользователя не должно превышать 50 символов',
  })
  @Matches(/^[a-zA-Z][a-zA-Z0-9_]*$/, {
    message:
      'Имя пользователя должно начинаться с буквы и может содержать только буквы, цифры и подчеркивание',
  })
  username?: string;

  @IsOptional()
  @IsString({ message: 'Информация о себе должна быть строкой' })
  @MaxLength(500, { message: 'Биография не должна превышать 500 символов' })
  bio?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Некорректный URL аватарки' })
  @MaxLength(255, { message: 'URL аватарки не должен превышать 255 символов' })
  avatarUrl?: string;

  @IsOptional()
  @IsString({ message: 'Telegram ID должен быть строкой' })
  @Matches(/^@[a-zA-Z0-9_]{5,32}$/, {
    message: 'Telegram ID должен начинаться с @ и содержать 5-32 символа',
  })
  telegramId?: string;
}
