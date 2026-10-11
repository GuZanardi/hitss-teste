import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
  meta?: any;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(
      map((res) => {
        // If response is already formatted as { data, meta }
        if (res && typeof res === 'object' && 'data' in res) {
          return {
            data: res.data,
            ...(res.meta ? { meta: res.meta } : {}),
          };
        }
        return { data: res };
      }),
    );
  }
}

