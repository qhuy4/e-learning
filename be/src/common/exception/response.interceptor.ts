import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface PaginationResult<T> {
    data: T[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

@Injectable()
export class ResponseInterceptor<T>
    implements NestInterceptor<T, any>
{
    intercept(
        context: ExecutionContext,
        next: CallHandler<T>,
    ): Observable<any> {
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
                        data: result.data,
                        meta: result.meta,
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