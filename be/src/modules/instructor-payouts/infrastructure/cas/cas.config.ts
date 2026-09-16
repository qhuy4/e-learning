import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CasConfig {
  constructor(private readonly configService: ConfigService) {}

  get clientId(): string {
    return this.configService.get<string>('BANK_HUB_CLIENT_ID', '');
  }

  get secretKey(): string {
    return this.configService.get<string>('BANK_HUB_SECRET_KEY', '');
  }

  get baseUrl(): string {
    return this.configService.get<string>(
      'BANK_HUB_BASE_URL',
      'https://sandbox.bankhub.dev',
    );
  }

  get linkUrl(): string {
    return this.configService.get<string>(
      'BANK_HUB_LINK_URL',
      'https://dev.link.bankhub.dev',
    );
  }

  get redirectUri(): string {
    return this.configService.get<string>(
      'BANK_HUB_REDIRECT_URI',
      'http://localhost:5175/payments/cas-callback',
    );
  }
}
