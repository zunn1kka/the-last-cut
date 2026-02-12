import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteAccountDto {
  @IsString({ message: 'Пароль должен быть строкой' })
  @IsNotEmpty({ message: 'Пароль обязателен для подтверждения' })
  password: string;
}
