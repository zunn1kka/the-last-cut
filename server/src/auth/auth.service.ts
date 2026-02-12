import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { hash, verify } from 'argon2';
import * as crypto from 'crypto';
import { Request, Response } from 'express';
import { UserRole } from 'generated/prisma/enums';
import { FileService } from 'src/file/file.service';
import { FileType } from 'src/lib/common/enums/type-file.enum';
import { isDev } from 'src/lib/common/utils/is-dev.util';
import { parseJwtTtl } from 'src/lib/common/utils/parse-jwt-ttl.util';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './interfaces/jwt.interface';
import { MailService } from './mail/mail.service';

@Injectable()
export class AuthService {
  private readonly JWT_ACC_TOKEN_TTL: string;
  private readonly JWT_REFRESH_TOKEN_TTL: string;
  private readonly COOKIE_DOMAIN: string;
  private readonly CLIENT_URL: string;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly fileService: FileService,
    private readonly mailService: MailService,
  ) {
    this.JWT_ACC_TOKEN_TTL =
      this.configService.getOrThrow<string>('JWT_ACC_TOKEN_TTL');
    this.JWT_REFRESH_TOKEN_TTL = this.configService.getOrThrow<string>(
      'JWT_REFRESH_TOKEN_TTL',
    );
    this.COOKIE_DOMAIN = configService.getOrThrow<string>('COOKIE_DOMAIN');
    this.CLIENT_URL = configService.getOrThrow<string>('CLIENT_URL');
  }

  async register(res: Response, dto: RegisterDto, avatar: Express.Multer.File) {
    const { username, email, password, telegramId } = dto;

    let avatarUrl: string | null = null;

    if (avatar) {
      const saveAvatar = await this.fileService.saveFile(
        avatar,
        FileType.AVATAR,
      );

      avatarUrl = saveAvatar.url || saveAvatar.path;
    }

    const existsUserEmail = await this.prismaService.user.findUnique({
      where: { email },
    });
    if (existsUserEmail) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    const existsUserTelegramId = await this.prismaService.user.findUnique({
      where: { telegramId },
    });
    if (existsUserTelegramId) {
      throw new ConflictException(
        'Пользователь с таким telegramId уже существует',
      );
    }

    const emailVerifyToken = this.generateTokenEmail();
    const emailTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await this.prismaService.user.create({
      data: {
        username,
        email,
        passwordHash: await hash(password),
        avatarUrl,
        telegramId,
        emailVerifyToken,
        emailTokenExpiresAt,
      },
    });

    await this.mailService.sendVerificationEmail(
      user.email,
      emailVerifyToken,
      user.username,
    );

    return this.auth(res, user.id, false);
  }

  async login(res: Response, dto: LoginDto) {
    const user = await this.prismaService.user.findUnique({
      where: { email: dto.email },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        passwordHash: true,
        emailVerified: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const isPasswordValid = await verify(user.passwordHash, dto.password);

    if (!isPasswordValid) {
      throw new NotFoundException('Неверный пароль');
    }

    return this.auth(res, user.id, false);
  }

  async logout(res: Response) {
    await this.SetCookie(res, 'refreshToken', '', new Date(0));

    return true;
  }

  async refreshToken(req: Request, res: Response) {
    const refreshToken = req.cookies['refreshToken'];

    if (!refreshToken) {
      throw new UnauthorizedException('Недействительный refresh токен');
    }

    const payload: JwtPayload = await this.jwtService.verifyAsync(refreshToken);

    if (payload) {
      const user = await this.prismaService.user.findUnique({
        where: { id: payload.id },
        select: {
          id: true,
        },
      });
      if (!user) {
        throw new NotFoundException(' Пользователь не найден');
      }
      return this.auth(res, user.id);
    }
  }

  async verifyEmail(token: string) {
    const user = await this.prismaService.user.findFirst({
      where: {
        emailVerifyToken: token,
        emailTokenExpiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new BadRequestException(
        'Неверный или просроченный токен подтверждения',
      );
    }

    await this.prismaService.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifyToken: null,
        emailTokenExpiresAt: null,
      },
    });

    return {
      message:
        'Email успешно подтвержден! Теперь вы можете комментировать фильмы.',
      userId: user.id,
    };
  }

  async resendVerificationEmail(email: string) {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        message: 'Если аккаунт существует, письмо отправлено',
      };
    }

    if (user?.emailVerified) {
      throw new BadRequestException('Email уже подтвержден');
    }

    const newToken = this.generateTokenEmail();

    await this.prismaService.user.update({
      where: { id: user?.id },
      data: {
        emailVerifyToken: newToken,
        emailTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    await this.mailService.sendVerificationEmail(
      user?.email,
      newToken,
      user?.username,
    );

    return { message: 'Письмо с подтверждением отправлено повторно' };
  }

  async validate(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    return user;
  }

  private async auth(res: Response, id: string, checkEmailVerified = true) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        telegramId: true,
        avatarUrl: true,
        emailVerified: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    if (checkEmailVerified && !user.emailVerified) {
      throw new BadRequestException('Email не подтвержден');
    }

    const { accessToken, refreshToken } = this.generateToken(user);

    this.SetCookie(
      res,
      'refreshToken',
      refreshToken,
      new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    );
    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        telegramId: user.telegramId,
        avatarUrl: user.avatarUrl,
        emailVerified: user.emailVerified,
      },
    };
  }

  private generateToken(user: {
    id: string;
    email: string;
    username: string;
    role: UserRole;
    emailVerified: boolean;
  }) {
    const accessPayload: JwtPayload = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      emailVerified: user.emailVerified,
    };

    const refreshPayload = { sub: user.id };

    const accessTokenExpiresIn = parseJwtTtl(this.JWT_ACC_TOKEN_TTL);
    const refreshTokenExpiresIn = parseJwtTtl(this.JWT_REFRESH_TOKEN_TTL);

    const accessToken = this.jwtService.sign(accessPayload, {
      expiresIn: accessTokenExpiresIn,
    });
    const refreshToken = this.jwtService.sign(refreshPayload, {
      expiresIn: refreshTokenExpiresIn,
    });

    return { accessToken, refreshToken };
  }

  private SetCookie(res: Response, name: string, value: string, expires: Date) {
    res.cookie(name, value, {
      httpOnly: true,
      domain: this.COOKIE_DOMAIN,
      expires,
      secure: !isDev(this.configService),
      sameSite: isDev(this.configService) ? 'none' : 'lax',
    });
  }
  private generateTokenEmail(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}
