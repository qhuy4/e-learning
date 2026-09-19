import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<any> {
    return next.handle().pipe(
      map((result) => {
        if (
          result &&
          typeof result === 'object' &&
          'data' in result &&
          'meta' in result
        ) {
          return {
            success: true,
            data: (result as any).data,
            ...((result as any).stats !== undefined ? { stats: (result as any).stats } : {}),
            meta: (result as any).meta,
          };
        }

        return {
          success: true,
          data: result,
          meta: null,
        };
      }),
    );
  }
}
