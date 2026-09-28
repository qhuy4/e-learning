import { ErrorCode } from '@/common/enum/error-code.enum';

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.INTERNAL_SERVER_ERROR]: 'Lỗi hệ thống',
  [ErrorCode.VALIDATION_ERROR]: 'Dữ liệu không hợp lệ',

  [ErrorCode.USER_NOT_FOUND]: 'Không tìm thấy người dùng',
  [ErrorCode.USER_ALREADY_EXISTS]: 'Người dùng đã tồn tại',
  [ErrorCode.INVALID_PASSWORD]: 'Mật khẩu không hợp lệ',
  [ErrorCode.INVALID_PERMISSION]: 'Không có quyền truy cập',
  [ErrorCode.PASSWORD_MISMATCH]: 'Mật khẩu không khớp',
  [ErrorCode.EMAIL_ALREADY_EXISTS]: 'Email đã tồn tại',
  [ErrorCode.INVALID_CREDENTIALS]: 'Thông tin đăng nhập không hợp lệ',

  [ErrorCode.AVAILABILITY_CONFLICT]: 'Lịch đã tồn tại khung giờ này',

  [ErrorCode.COURSE_NOT_FOUND]: 'Khóa học không tồn tại',
  [ErrorCode.COURSE_NO_SECTIONS]:
    'Khóa học phải có ít nhất một chương trước khi gửi duyệt',
  [ErrorCode.COURSE_NO_LESSONS]:
    'Mỗi chương phải có ít nhất một bài học trước khi gửi duyệt',
  [ErrorCode.COURSE_THUMBNAIL_NOT_FOUND]: 'File thumbnail không tồn tại',
  [ErrorCode.COURSE_NOT_EDITABLE]:
    'Không thể chỉnh sửa khóa học ở trạng thái hiện tại',
  [ErrorCode.COURSE_PREVIEW_NOT_FOUND]: 'Không tìm thấy bản xem trước khóa học',

  [ErrorCode.SECTION_NOT_FOUND]: 'Chương không tồn tại',
  [ErrorCode.LESSON_NOT_FOUND]: 'Bài học không tồn tại',

  [ErrorCode.ORDER_NOT_FOUND]: 'Đơn hàng không tồn tại',
  [ErrorCode.ORDER_INVALID_STATUS_TRANSITION]:
    'Không thể chuyển trạng thái đơn hàng',
  [ErrorCode.ORDER_COURSE_DUPLICATE]: 'Khóa học bị trùng trong đơn hàng',
  [ErrorCode.ORDER_EMPTY]: 'Đơn hàng phải có ít nhất một khóa học',

  [ErrorCode.ENROLLMENT_NOT_FOUND]: 'Ghi danh không tồn tại',
  [ErrorCode.ENROLLMENT_ALREADY_EXISTS]: 'Đã ghi danh khóa học này',

  [ErrorCode.PAYMENT_NOT_FOUND]: 'Không tìm thấy giao dịch',
  [ErrorCode.PAYMENT_ALREADY_COMPLETED]: 'Giao dịch đã hoàn thành',
  [ErrorCode.PAYMENT_GATEWAY_ERROR]: 'Lỗi cổng thanh toán',
  [ErrorCode.PAYMENT_INVALID_STATUS_TRANSITION]:
    'Không thể chuyển trạng thái giao dịch',
  [ErrorCode.PAYMENT_CANNOT_CANCEL]: 'Không thể hủy giao dịch đã hoàn thành',
  [ErrorCode.PAYMENT_NO_TRANSACTION]: 'Giao dịch không có mã giao dịch',
  [ErrorCode.PAYMENT_REFUND_FAILED]: 'Hoàn tiền thất bại',

  [ErrorCode.COUPON_NOT_FOUND]: 'Mã giảm giá không tồn tại',
  [ErrorCode.COUPON_CODE_EXISTS]: 'Mã giảm giá đã tồn tại',

  [ErrorCode.CATEGORY_NOT_FOUND]: 'Danh mục không tồn tại',
  [ErrorCode.CATEGORY_SLUG_EXISTS]: 'Đường dẫn danh mục đã tồn tại',
  [ErrorCode.CATEGORY_CANNOT_PARENT_SELF]:
    'Danh mục không thể là cha của chính nó',

  [ErrorCode.INSTRUCTOR_NOT_FOUND]: 'Không tìm thấy giảng viên',
  [ErrorCode.INSTRUCTOR_PROFILE_NOT_FOUND]: 'Không tìm thấy hồ sơ giảng viên',
  [ErrorCode.TEACHER_REGISTRATION_NOT_FOUND]:
    'Không tìm thấy đăng ký giảng viên',

  [ErrorCode.PAYOUT_NOT_FOUND]: 'Không tìm thấy yêu cầu rút tiền',
  [ErrorCode.PAYOUT_ALREADY_PROCESSED]: 'Yêu cầu rút tiền đã được xử lý',
  [ErrorCode.PAYOUT_ACCOUNT_NOT_FOUND]: 'Tài khoản thanh toán không tồn tại',

  [ErrorCode.REVIEW_NOT_FOUND]: 'Không tìm thấy đánh giá',
  [ErrorCode.COURSE_QUESTION_NOT_FOUND]: 'Câu hỏi không tồn tại',
  [ErrorCode.COURSE_QUESTION_ANSWER_NOT_FOUND]: 'Câu trả lời không tồn tại',
  [ErrorCode.REVENUE_SPLIT_NOT_FOUND]: 'Chia sẻ doanh thu không tồn tại',
  [ErrorCode.NO_REVENUE_SPLITS_FOR_PERIOD]:
    'Không có doanh thu nào trong khoảng thời gian này',

  [ErrorCode.REVIEW_REPORT_NOT_FOUND]: 'Không tìm thấy báo cáo đánh giá',
  [ErrorCode.REVIEW_REPORT_RESOLVE_FAILED]: 'Không thể xử lý báo cáo',
  [ErrorCode.REVIEW_REPORT_DISMISS_FAILED]: 'Không thể từ chối báo cáo',
  [ErrorCode.REVIEW_REPORT_DELETE_FAILED]: 'Không thể xóa báo cáo',

  [ErrorCode.CERTIFICATE_NOT_FOUND]: 'Không tìm thấy chứng chỉ',
  [ErrorCode.INSTRUCTOR_CERTIFICATE_NOT_FOUND]:
    'Không tìm thấy chứng chỉ giảng viên',
  [ErrorCode.INSTRUCTOR_CERTIFICATE_REVIEW_FAILED]: 'Không thể duyệt chứng chỉ',

  [ErrorCode.NOTIFICATION_NOT_FOUND]: 'Không tìm thấy thông báo',
  [ErrorCode.NOTIFICATION_DELETE_FAILED]: 'Không thể xóa thông báo',

  [ErrorCode.SUBSCRIPTION_NOT_FOUND]: 'Không tìm thấy gói đăng ký',
  [ErrorCode.SUBSCRIPTION_UPDATE_FAILED]: 'Không thể cập nhật gói đăng ký',
  [ErrorCode.WISHLIST_NOT_FOUND]: 'Không tìm thấy danh sách yêu thích',
  [ErrorCode.WISHLIST_ITEM_NOT_FOUND]: 'Không tìm thấy mục trong danh sách',

  [ErrorCode.ACHIEVEMENT_NOT_FOUND]: 'Không tìm thấy huy hiệu',
  [ErrorCode.ACHIEVEMENT_NAME_EXISTS]: 'Tên huy hiệu đã tồn tại',
  [ErrorCode.USER_ACHIEVEMENT_ALREADY_EXISTS]:
    'Người dùng đã nhận huy hiệu này',

  [ErrorCode.BOOKING_NOT_FOUND]: 'Không tìm thấy buổi đặt lịch',
  [ErrorCode.BOOKING_TIME_CONFLICT]: 'Khung giờ đặt lịch bị trùng',
  [ErrorCode.BOOKING_INVALID_STATUS_TRANSITION]:
    'Không thể chuyển trạng thái buổi đặt lịch',

  [ErrorCode.UNAUTHORIZED]: 'KHÔNG ĐƯỢC PHÉP',
};
