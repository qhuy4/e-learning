import { ErrorCode } from '../enum/error-code.enum';
import { HttpStatus } from '@nestjs/common';
import { ERROR_MESSAGES } from '@/common/constants/error.message';

export class AppException extends Error {
  constructor(
    public readonly code: ErrorCode,
    public readonly statusCode: HttpStatus,
    public readonly details?: unknown,
  ) {
    super(ERROR_MESSAGES[code]);

    this.name = 'AppException';

    Object.setPrototypeOf(this, new.target.prototype);
  }
}
