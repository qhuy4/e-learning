import { ErrorCode } from '../enum/error-code.enum';

export class AppException extends Error {
    constructor(
        public readonly code: ErrorCode,
        message: string,
        public readonly statusCode: number,
        public readonly details?: unknown,
    ) {
        super(message);

        this.name = 'AppException';

        Object.setPrototypeOf(this, new.target.prototype);
    }
}