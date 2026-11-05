import { InstructorEmailTemplate } from '@/modules/instructor-applications/domain/enums/instructor-email-template.enum';

export interface InstructorEmailPayload {
  name?: string;
  applicationUrl?: string;
  activationUrl?: string;
  reason?: string;
  expiresIn?: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function button(label: string, url: string): string {
  return `<p style="margin:28px 0;text-align:center;">
    <a href="${escapeHtml(url)}" style="background:#4f46e5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block;">${escapeHtml(label)}</a>
  </p>
  <p style="word-break:break-all;color:#6b7280;font-size:13px;">${escapeHtml(url)}</p>`;
}

function layout(title: string, body: string): string {
  return `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111827;">
    <h2 style="color:#4f46e5;">${escapeHtml(title)}</h2>
    ${body}
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
    <p style="color:#9ca3af;font-size:12px;">Chương trình giảng viên PiEMind</p>
  </div>`;
}

export function renderInstructorEmail(
  template: InstructorEmailTemplate,
  payload: InstructorEmailPayload,
): { subject: string; html: string } {
  const name = escapeHtml(payload.name || 'bạn');

  switch (template) {
    case InstructorEmailTemplate.APPLICATION_LINK:
      return {
        subject: 'Hoàn tất đơn đăng ký giảng viên - PiEMind',
        html: layout(
          'Mời bạn hoàn tất đơn đăng ký giảng viên',
          `<p>Xin chào ${name},</p>
          <p>Cảm ơn bạn đã quan tâm chương trình giảng viên của PiEMind. Vui lòng mở liên kết bên dưới để điền hồ sơ và tải lên chứng chỉ.</p>
          ${button('Điền đơn đăng ký', payload.applicationUrl ?? '')}
          <p>Liên kết có hiệu lực trong ${escapeHtml(payload.expiresIn ?? '24 giờ')} và chỉ dùng được một lần.</p>`,
        ),
      };

    case InstructorEmailTemplate.APPLICATION_RECEIVED:
      return {
        subject: 'Đã nhận đơn đăng ký giảng viên - PiEMind',
        html: layout(
          'Đã nhận đơn đăng ký của bạn',
          `<p>Xin chào ${name},</p>
          <p>Hồ sơ giảng viên của bạn đã được gửi tới đội ngũ PiEMind. Chúng tôi sẽ xem xét và phản hồi qua email này.</p>`,
        ),
      };

    case InstructorEmailTemplate.APPLICATION_NEEDS_INFORMATION:
      return {
        subject: 'Cần bổ sung thông tin đơn giảng viên - PiEMind',
        html: layout(
          'Cần bổ sung thông tin',
          `<p>Xin chào ${name},</p>
          <p>Hồ sơ giảng viên của bạn cần bổ sung thông tin trước khi tiếp tục xét duyệt.</p>
          <p style="background:#fef3c7;padding:12px;border-radius:8px;">${escapeHtml(payload.reason ?? '')}</p>
          ${payload.applicationUrl ? button('Cập nhật hồ sơ', payload.applicationUrl) : ''}`,
        ),
      };

    case InstructorEmailTemplate.APPLICATION_REJECTED:
      return {
        subject: 'Kết quả đơn đăng ký giảng viên - PiEMind',
        html: layout(
          'Đơn đăng ký chưa được chấp thuận',
          `<p>Xin chào ${name},</p>
          <p>Cảm ơn bạn đã dành thời gian cho chương trình giảng viên. Hiện tại hồ sơ của bạn chưa phù hợp để tiếp tục.</p>
          ${payload.reason ? `<p style="background:#fee2e2;padding:12px;border-radius:8px;">${escapeHtml(payload.reason)}</p>` : ''}
          <p>Bạn có thể đăng ký lại sau 24 giờ kể từ thời điểm hồ sơ bị từ chối.</p>`,
        ),
      };

    case InstructorEmailTemplate.APPLICATION_APPROVED:
      return {
        subject: 'Chúc mừng! Hồ sơ giảng viên đã được duyệt - PiEMind',
        html: layout(
          'Hồ sơ giảng viên đã được duyệt',
          `<p>Xin chào ${name},</p>
          <p>Hồ sơ giảng viên của bạn đã được duyệt. Bạn có thể bắt đầu nhận học viên trên PiEMind.</p>`,
        ),
      };

    case InstructorEmailTemplate.ACTIVATION_LINK:
      return {
        subject: 'Kích hoạt tài khoản giảng viên - PiEMind',
        html: layout(
          'Kích hoạt tài khoản giảng viên',
          `<p>Xin chào ${name},</p>
          <p>Hồ sơ giảng viên của bạn đã được duyệt. Vui lòng kích hoạt tài khoản để bắt đầu.</p>
          ${button('Kích hoạt tài khoản', payload.activationUrl ?? '')}
          <p>Liên kết có hiệu lực trong ${escapeHtml(payload.expiresIn ?? '7 ngày')} và chỉ dùng được một lần.</p>`,
        ),
      };
  }
}
