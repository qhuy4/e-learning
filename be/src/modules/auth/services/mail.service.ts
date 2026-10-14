import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT', 587);
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      this.logger.log(`SMTP Mail Transporter đã được cấu hình với host: ${host}`);
    } else {
      this.logger.warn('Chưa cấu hình SMTP (SMTP_HOST, SMTP_USER, SMTP_PASS). Sẽ xuất link đăng ký trực tiếp ra console log để test.');
    }
  }

  async sendEmailVerification(email: string, token: string): Promise<void> {
    const frontendUrl = this.configService.get<string>(
      'FRONTEND_CLIENT_URL',
      'http://localhost:5173',
    );
    const verificationUrl = `${frontendUrl.replace(/\/$/, '')}/student/verify-email?token=${encodeURIComponent(token)}`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #f38181;">Xác minh địa chỉ email</h2>
        <p>Cảm ơn bạn đã đăng ký PiEMind. Nhấn nút bên dưới để kích hoạt tài khoản:</p>
        <p style="margin: 28px 0;">
          <a href="${verificationUrl}" style="background: #f38181; color: white; padding: 12px 24px; border-radius: 999px; text-decoration: none; font-weight: bold;">Xác minh email</a>
        </p>
        <p>Liên kết có hiệu lực trong 24 giờ. Nếu bạn không tạo tài khoản, hãy bỏ qua email này.</p>
        <p style="word-break: break-all; color: #666; font-size: 13px;">${verificationUrl}</p>
      </div>
    `;

    if (!this.transporter) {
      this.logger.warn(`Email verification link for ${email}: ${verificationUrl}`);
      return;
    }

    await this.transporter.sendMail({
      from: this.configService.get<string>(
        'MAIL_FROM',
        `"E-Learning Platform" <${this.configService.get<string>('SMTP_USER')}>`,
      ),
      to: email,
      subject: 'Xác minh email - PiEMind',
      html: htmlContent,
    });
  }

  async sendInstructorInvite(email: string, token: string): Promise<{ registerUrl: string }> {
    const frontendUrl = this.configService.get<string>(
      'FRONTEND_CLIENT_URL',
      'http://localhost:5173',
    );
    if (new URL(frontendUrl).hostname === 'localhost') {
      this.logger.warn('FRONTEND_CLIENT_URL đang dùng localhost; link email không mở được trên thiết bị khác.');
    }
    const registerUrl = `${frontendUrl.replace(/\/$/, '')}/instructor/register?session=${token}`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #4f46e5; text-align: center;">Chào mừng bạn đến với E-Learning Platform!</h2>
        <p>Xin chào,</p>
        <p>Bạn (hoặc ai đó) vừa yêu cầu đăng ký tài khoản Giảng viên tại hệ thống E-Learning của chúng tôi.</p>
        <p>Vui lòng nhấn vào nút bên dưới để hoàn tất việc tạo tài khoản Giảng viên của bạn:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${registerUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Hoàn tất Đăng Ký Giảng Viên
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">Hoặc copy đường dẫn sau dán vào trình duyệt:</p>
        <p style="background: #f3f4f6; padding: 10px; border-radius: 4px; word-break: break-all; font-size: 13px;">${registerUrl}</p>
        <p style="color: #dc2626; font-size: 13px;">* Lưu ý: Đường dẫn này có hiệu lực trong vòng 30 phút.</p>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.</p>
      </div>
    `;

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: this.configService.get<string>('MAIL_FROM', `"E-Learning Platform" <${this.configService.get<string>('SMTP_USER')}>`),
          to: email,
          subject: 'Xác nhận Đăng ký tài khoản Giảng viên - E-Learning Platform',
          html: htmlContent,
        });
        this.logger.log(`Đã gửi email mời đăng ký giảng viên thành công tới: ${email}`);
      } catch (error) {
        this.logger.error(`Lỗi khi gửi email qua SMTP: ${(error as Error).message}`);
        throw new BadRequestException(`Không thể gửi email tới ${email}. Vui lòng kiểm tra lại cấu hình SMTP: ${(error as Error).message}`);
      }
    } else {
      throw new BadRequestException(
        'Hệ thống chưa được cấu hình tài khoản gửi mail (SMTP). Vui lòng thêm SMTP_HOST, SMTP_USER, SMTP_PASS vào file .env.',
      );
    }

    return { registerUrl };
  }
}
