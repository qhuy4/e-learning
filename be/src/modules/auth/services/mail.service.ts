import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly configService: ConfigService) {
    const user = this.configService.get<string>('SMTP_USER')?.trim();
    const rawPass = this.configService.get<string>('SMTP_PASS');
    const isGmail =
      user?.toLowerCase().endsWith('@gmail.com') ||
      user?.toLowerCase().endsWith('@googlemail.com');
    const pass = isGmail ? rawPass?.replace(/\s+/g, '') : rawPass;
    const host =
      this.configService.get<string>('SMTP_HOST')?.trim() ||
      (user && isGmail ? 'smtp.gmail.com' : '');
    const port = Number(this.configService.get<string>('SMTP_PORT', '587')) || 587;
    const secureConfig = this.configService.get<string>('SMTP_SECURE');
    const secure = secureConfig ? secureConfig === 'true' : port === 465;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        requireTLS: !secure && port === 587,
        auth: { user, pass },
        connectionTimeout: 10_000,
        greetingTimeout: 10_000,
        socketTimeout: 20_000,
      });
      this.logger.log(`SMTP Mail Transporter đã được cấu hình với host: ${host}`);
    } else {
      this.logger.warn(
        'Chưa cấu hình SMTP (SMTP_HOST, SMTP_USER, SMTP_PASS). Email sẽ không được gửi.',
      );
    }
  }

  async onModuleInit(): Promise<void> {
    if (!this.transporter) return;

    try {
      await this.transporter.verify();
      this.logger.log('SMTP connection verified successfully.');
    } catch (error) {
      this.logger.error(
        `SMTP connection verification failed: ${(error as Error).message}`,
      );
    }
  }

  async sendHtml(email: string, subject: string, html: string): Promise<void> {
    if (!this.transporter) {
      throw new Error(
        'SMTP chưa được cấu hình. Thêm SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS và MAIL_FROM vào be/.env.',
      );
    }

    await this.transporter.sendMail({
      from: this.configService.get<string>(
        'MAIL_FROM',
        `"E-Learning Platform" <${this.configService.get<string>('SMTP_USER')}>`,
      ),
      to: email,
      subject,
      html,
    });
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

  async sendPasswordReset(email: string, token: string): Promise<void> {
    const frontendUrl = this.configService.get<string>(
      'FRONTEND_CLIENT_URL',
      'http://localhost:5173',
    );
    const resetUrl = `${frontendUrl.replace(/\/$/, '')}/student/reset-password?token=${encodeURIComponent(token)}`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #f38181;">Đặt lại mật khẩu</h2>
        <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu PiEMind của bạn.</p>
        <p style="margin: 28px 0;">
          <a href="${resetUrl}" style="background: #f38181; color: white; padding: 12px 24px; border-radius: 999px; text-decoration: none; font-weight: bold;">Đặt lại mật khẩu</a>
        </p>
        <p>Liên kết có hiệu lực trong 1 giờ. Nếu bạn không yêu cầu thao tác này, hãy bỏ qua email.</p>
        <p style="word-break: break-all; color: #666; font-size: 13px;">${resetUrl}</p>
      </div>
    `;

    if (!this.transporter) {
      this.logger.warn(`Password reset link for ${email}: ${resetUrl}`);
      return;
    }

    await this.transporter.sendMail({
      from: this.configService.get<string>(
        'MAIL_FROM',
        `"E-Learning Platform" <${this.configService.get<string>('SMTP_USER')}>`,
      ),
      to: email,
      subject: 'Đặt lại mật khẩu - PiEMind',
      html: htmlContent,
    });
  }
}
