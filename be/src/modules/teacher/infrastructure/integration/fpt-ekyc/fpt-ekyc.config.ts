import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Cấu hình kết nối tới FPT.AI eKYC.
 * Cần khai báo trong file .env của dự án:
 *
 *   FPT_EKYC_API_KEY=xxxxxxxxxxxxxxxx
 *   FPT_EKYC_BASE_URL=https://api.fpt.ai/vision/ekyc/be-stag   # staging
 *   # FPT_EKYC_BASE_URL=https://api.fpt.ai/vision/ekyc-be      # production
 *   FPT_EKYC_DEVICE_TYPE=web-sdk
 *   FPT_EKYC_LANG=vi
 */
@Injectable()
export class FptEkycConfig {
  constructor(private readonly configService: ConfigService) {}

  get apiKey(): string {
    return this.configService.get<string>('FPT_EKYC_API_KEY', '');
  }

  get baseUrl(): string {
    return this.configService.get<string>(
      'FPT_EKYC_BASE_URL',
      'https://api.fpt.ai/vision/ekyc/be-stag',
    );
  }

  get deviceType(): string {
    return this.configService.get<string>('FPT_EKYC_DEVICE_TYPE', 'web-sdk');
  }

  get lang(): string {
    return this.configService.get<string>('FPT_EKYC_LANG', 'vi');
  }
}
