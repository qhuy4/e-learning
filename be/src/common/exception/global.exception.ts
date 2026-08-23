import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { AppException } from './app.exception';
import { ErrorCode } from '../enum/error-code.enum';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();

        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;

        let code: ErrorCode | string =
            ErrorCode.INTERNAL_SERVER_ERROR;

        let message = 'Internal server error';

        let details: unknown = null;

        if (exception instanceof AppException) {
            status = exception.statusCode;
            code = exception.code;
            message = exception.message;
            details = exception.details ?? null;
        }

        else if (exception instanceof HttpException) {
            status = exception.getStatus();

            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            } else if (
                typeof exceptionResponse === 'object' &&
                exceptionResponse !== null
            ) {
                const responseBody = exceptionResponse as {
                    message?: string | string[];
                };

                if (Array.isArray(responseBody.message)) {
                    message = 'Validation failed';
                    details = responseBody.message;
                } else {
                    message =
                        responseBody.message ??
                        'Request failed';
                }
            }

            code = this.getHttpErrorCode(status);
        }

        response.status(status).json({
            success: false,
            data: null,
            error: {
                code,
                message,
                details,
            },
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }

    private getHttpErrorCode(status: number): string {
        switch (status) {
            case HttpStatus.BAD_REQUEST:
                return 'BAD_REQUEST';

            case HttpStatus.UNAUTHORIZED:
                return 'UNAUTHORIZED';

            case HttpStatus.FORBIDDEN:
                return 'FORBIDDEN';

            case HttpStatus.NOT_FOUND:
                return 'NOT_FOUND';

            case HttpStatus.CONFLICT:
                return 'CONFLICT';

            default:
                return 'INTERNAL_SERVER_ERROR';
        }
    }
}