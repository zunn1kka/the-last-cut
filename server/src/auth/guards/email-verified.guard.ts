import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class EmailVerifiedGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ForbiddenException('Требуется авторизация');
    }

    const token = authHeader.split(' ')[1];

    const payload = await this.jwtService.verifyAsync(token, {
      secret: this.configService.getOrThrow('JWT_SECRET'),
    });

    if (!payload.emailVerified) {
      throw new ForbiddenException(
        'Для выполнения этого действия необходимо подтвердить email. ' +
          'Проверьте вашу почту или запросите новое письмо с подтверждением.',
      );
    }
    request.user = payload;

    return true;
  }
}
