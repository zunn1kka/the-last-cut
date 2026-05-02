import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class DateInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => this.convertDates(data)));
  }

  private convertDates(obj: any): any {
    if (!obj) return obj;

    const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

    for (const key of Object.keys(obj)) {
      const value = obj[key];
      if (typeof value === 'string' && isoDateRegex.test(value)) {
        obj[key] = value;
      } else if (value && typeof value === 'object') {
        this.convertDates(value);
      }
    }
    return obj;
  }
}
