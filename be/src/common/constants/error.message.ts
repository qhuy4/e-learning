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

  [ErrorCode.ENROLLMENT_NOT_FOUND]: 'Ghi danh không tồn tại',

  [ErrorCode.COUPON_NOT_FOUND]: 'Mã giảm giá không tồn tại',
  [ErrorCode.COUPON_CODE_EXISTS]: 'Mã giảm giá đã tồn tại',

  [ErrorCode.CATEGORY_NOT_FOUND]: 'Danh mục không tồn tại',
  [ErrorCode.CATEGORY_SLUG_EXISTS]: 'Đường dẫn danh mục đã tồn tại',
  [ErrorCode.CATEGORY_CANNOT_PARENT_SELF]: 'Danh mục không thể là cha của chính nó',

  [ErrorCode.PAYOUT_NOT_FOUND]: 'Thanh toán không tồn tại',
  [ErrorCode.PAYOUT_ALREADY_PROCESSED]: 'Thanh toán đã được xử lý',
  [ErrorCode.PAYOUT_ACCOUNT_NOT_FOUND]: 'Tài khoản thanh toán không tồn tại',

  [ErrorCode.COURSE_QUESTION_NOT_FOUND]: 'Câu hỏi không tồn tại',
  [ErrorCode.COURSE_QUESTION_ANSWER_NOT_FOUND]: 'Câu trả lời không tồn tại',
  [ErrorCode.REVENUE_SPLIT_NOT_FOUND]: 'Chia sẻ doanh thu không tồn tại',
  [ErrorCode.NO_REVENUE_SPLITS_FOR_PERIOD]: 'Không có doanh thu nào trong khoảng thời gian này',

  [ErrorCode.REVIEW_REPORT_NOT_FOUND]: 'Không tìm thấy báo cáo đánh giá',
  [ErrorCode.REVIEW_REPORT_RESOLVE_FAILED]: 'Không thể xử lý báo cáo',
  [ErrorCode.REVIEW_REPORT_DISMISS_FAILED]: 'Không thể từ chối báo cáo',
  [ErrorCode.REVIEW_REPORT_DELETE_FAILED]: 'Không thể xóa báo cáo',
};
