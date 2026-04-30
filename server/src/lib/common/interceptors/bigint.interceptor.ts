import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class BigIntInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => this.convertBigInts(data)));
  }

  private convertBigInts(obj: any): any {
    if (obj === null || obj === undefined) return obj;

    // Если это BigInt - конвертируем в number
    if (typeof obj === 'bigint') {
      return Number(obj);
    }

    // Если это Decimal из Prisma (имеет поля s, e, d) - конвертируем в число
    if (obj?.s !== undefined && obj?.e !== undefined && obj?.d !== undefined) {
      // Пробуем получить число
      const num = Number(obj.toString?.() || obj);
      return isNaN(num) ? null : num;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.convertBigInts(item));
    }

    if (typeof obj === 'object') {
      const converted = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          converted[key] = this.convertBigInts(obj[key]);
        }
      }
      return converted;
    }

    return obj;
  }
}
