import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('avatarUrl'))
  @ApiOperation({
    summary: 'Регистрация нового пользователя',
    description: 'Создает нового пользователя с указанными данными',
  })
  @ApiBody({
    description: 'Данные для регистрации',
    type: RegisterDto,
  })
  @ApiOkResponse({
    type: AuthDto,
  })
  @ApiBadRequestResponse({
    description: 'Невалидные данные или пароли не совпадают',
  })
  @ApiConflictResponse({
    description: 'Пользователь с таким email или username уже существует',
  })
  async register(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: RegisterDto,
    @UploadedFile()
    avatar: Express.Multer.File,
  ) {
    return await this.authService.register(res, dto, avatar);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Вход в систему',
    description: 'Аутентификация пользователя по email и паролю',
  })
  @ApiBody({
    description: 'Данные для входа',
    type: LoginDto,
  })
  @ApiOkResponse({
    description: 'Успешный вход',
    type: AuthDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Неверный email или пароль',
  })
  @ApiBadRequestResponse({
    description: 'Невалидные данные',
  })
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: LoginDto,
  ) {
    return await this.authService.login(res, dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Выход из системы',
    description: 'Удаляет refresh token из cookies и инвалидирует сессию.',
  })
  @ApiOkResponse({
    description: 'Успешный выход',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Успешный выход из системы',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Пользователь не авторизован',
  })
  async logout(@Res({ passthrough: true }) res: Response) {
    return await this.authService.logout(res);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth('refreshToken')
  @ApiOperation({
    summary: 'Обновление токена доступа',
    description: 'Обновляет access token с помощью refresh token из cookies.',
  })
  @ApiOkResponse({
    description: 'Токен успешно обновлен',
  })
  @ApiUnauthorizedResponse({
    description: 'Невалидный или истекший refresh token',
  })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.authService.refreshToken(req, res);
  }

  @Get('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Подтверждение email',
    description: 'Активирует аккаунт пользователя по верификационному токену.',
  })
  @ApiQuery({
    name: 'token',
    description: 'Верификационный токен из письма',
    required: true,
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @ApiOkResponse({
    description: 'Email успешно подтвержден',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Email успешно подтвержден',
        },
        user: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
            email: { type: 'string', example: 'user@example.com' },
            emailVerified: { type: 'boolean', example: true },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Невалидный или истекший токен',
  })
  @ApiNotFoundResponse({
    description: 'Пользователь не найден',
  })
  async verifyEmail(@Query('token') token: string) {
    return await this.authService.verifyEmail(token);
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Повторная отправка верификационного письма',
    description: 'Отправляет новое письмо для подтверждения email.',
  })
  @ApiBody({
    description: 'Email пользователя',
    type: ResendVerificationDto,
  })
  @ApiOkResponse({
    description: 'Письмо отправлено',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Верификационное письмо отправлено',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Невалидный email',
  })
  @ApiNotFoundResponse({
    description: 'Пользователь не найден',
  })
  @ApiConflictResponse({
    description: 'Email уже подтвержден',
  })
  async resendVerification(@Body() dto: ResendVerificationDto) {
    return await this.authService.resendVerificationEmail(dto.email);
  }
}
