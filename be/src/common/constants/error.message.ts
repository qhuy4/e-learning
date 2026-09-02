import { ErrorCode } from '../enum/error-code.enum';

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.INTERNAL_SERVER_ERROR]: 'Internal server error',
  [ErrorCode.VALIDATION_ERROR]: 'Validation failed',

  [ErrorCode.USER_NOT_FOUND]: 'User not found',
  [ErrorCode.USER_ALREADY_EXISTS]: 'User already exists',
  [ErrorCode.INVALID_PASSWORD]: 'Invalid password',
  [ErrorCode.INVALID_PERMISSION]: 'Invalid permission',
  [ErrorCode.PASSWORD_MISMATCH]: 'Passwords do not match',
  [ErrorCode.EMAIL_ALREADY_EXISTS]: 'Email already exists',
  [ErrorCode.INVALID_CREDENTIALS]: 'Invalid credentials',
};
