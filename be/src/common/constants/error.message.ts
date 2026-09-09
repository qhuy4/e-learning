import { ErrorCode } from '@/common/enum/error-code.enum';

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

  [ErrorCode.AVAILABILITY_CONFLICT]: 'Lịch đã tồn tại khung giờ này',

  [ErrorCode.COURSE_NOT_FOUND]: 'Khóa học không tồn tại',
  [ErrorCode.COURSE_NO_SECTIONS]: 'Khóa học phải có ít nhất một chương trước khi gửi duyệt',
  [ErrorCode.COURSE_NO_LESSONS]: 'Khóa học phải có ít nhất một bài học trước khi gửi duyệt',
  [ErrorCode.COURSE_THUMBNAIL_NOT_FOUND]: 'File thumbnail không tồn tại',
  [ErrorCode.COURSE_NOT_EDITABLE]: 'Không thể chỉnh sửa khóa học ở trạng thái hiện tại',

  [ErrorCode.ORDER_NOT_FOUND]: 'Đơn hàng không tồn tại',
  [ErrorCode.ORDER_INVALID_STATUS_TRANSITION]: 'Không thể chuyển trạng thái đơn hàng',
  [ErrorCode.ORDER_COURSE_DUPLICATE]: 'Khóa học bị trùng trong đơn hàng',
  [ErrorCode.ORDER_EMPTY]: 'Đơn hàng phải có ít nhất một khóa học',

  [ErrorCode.ENROLLMENT_NOT_FOUND]: 'Ghi danh không tồn tại',
  [ErrorCode.ENROLLMENT_ALREADY_EXISTS]: 'Đã ghi danh khóa học này',

  [ErrorCode.PAYMENT_NOT_FOUND]: 'Payment not found',
  [ErrorCode.PAYMENT_ALREADY_COMPLETED]: 'Payment is already completed',
  [ErrorCode.PAYMENT_GATEWAY_ERROR]: 'Payment gateway error',
  [ErrorCode.PAYMENT_INVALID_STATUS_TRANSITION]:
    'Invalid payment status transition',
};
