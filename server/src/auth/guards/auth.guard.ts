import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const routePath = request.route?.path;

    // Список публичных маршрутов
    const publicRoutes = [
      '/',
      '/auth/register',
      '/auth/login',
      '/auth/refresh',
      '/auth/forgot-password',
      '/auth/reset-password',
      '/auth/verify-email',
    ];

    // Если маршрут публичный - пропускаем без проверки
    if (publicRoutes.some((route) => routePath?.includes(route))) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest<TUser = any>(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
  ): TUser {
    if (err || !user) {
      throw err || new UnauthorizedException('Неверный токен');
    }
    const request = context.switchToHttp().getRequest();
    request.user = user;

    return user;
  }
}
