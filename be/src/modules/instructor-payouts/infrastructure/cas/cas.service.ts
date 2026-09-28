import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { CasConfig } from '@/modules/instructor-payouts/infrastructure/cas/cas.config';

export interface CasGrantTokenResponse {
  grantToken: string;
}

export interface CasExchangeResponse {
  accessToken: string;
}

export interface CasIdentityResponse {
  accountHolderName: string;
  accountNumber: string | null;
  bankCode: string | null;
}

@Injectable()
export class CasService {
  private readonly logger = new Logger(CasService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly config: CasConfig,
  ) {}

  private get commonHeaders() {
    return {
      'x-client-id': this.config.clientId,
      'x-secret-key': this.config.secretKey,
      'X-BankHub-Api-Version': '2023-01-01',
      'Content-Type': 'application/json',
    };
  }

  async createGrantToken(redirectUri: string): Promise<CasGrantTokenResponse> {
    const url = `${this.config.baseUrl}/grant/token`;

    try {
      const { data } = await firstValueFrom(
        this.httpService.post(
          url,
          {
            scopes: 'identity',
            language: 'vi',
            redirectUri,
          },
          { headers: this.commonHeaders },
        ),
      );

      if (!data?.grantToken) {
        throw new Error('Cas createGrantToken: missing grantToken in response');
      }

      return { grantToken: data.grantToken };
    } catch (error) {
      const err = error as any;
      const casMessage =
        err?.response?.data?.errorMessage ||
        err?.response?.data?.message ||
        err?.message ||
        'unknown';
      this.logger.error(`Cas createGrantToken failed: ${casMessage}`);
      throw new BadRequestException(`Cas error: ${casMessage}`);
    }
  }

  async exchangePublicToken(publicToken: string): Promise<CasExchangeResponse> {
    const url = `${this.config.baseUrl}/grant/exchange`;

    try {
      const { data } = await firstValueFrom(
        this.httpService.post(
          url,
          { publicToken },
          { headers: this.commonHeaders },
        ),
      );

      this.logger.log(`Cas exchange response: ${JSON.stringify(data)}`);

      const accessToken = data?.accessToken ?? data?.access_token ?? data?.data?.accessToken ?? '';

      if (!accessToken) {
        throw new Error('Cas exchangePublicToken: missing accessToken in response');
      }

      return { accessToken };
    } catch (error) {
      const err = error as any;
      const casMessage =
        err?.response?.data?.errorMessage ||
        err?.response?.data?.message ||
        err?.message ||
        'unknown';
      this.logger.error(`Cas exchangePublicToken failed: ${casMessage}`);
      throw new BadRequestException(`Cas exchange failed: ${casMessage}`);
    }
  }

  async getIdentity(accessToken: string): Promise<CasIdentityResponse> {
    const url = `${this.config.baseUrl}/identity`;

    try {
      const { data } = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            ...this.commonHeaders,
            Authorization: accessToken,
          },
        }),
      );

      this.logger.log(`Cas identity response: ${JSON.stringify(data)}`);

      const account = data?.accounts?.[0];

      return {
        accountHolderName: account?.accountName ?? '',
        accountNumber: account?.accountNumber ?? null,
        bankCode: data?.fiService?.code ?? null,
      };
    } catch (error) {
      const err = error as any;

      const casMessage =
        err?.response?.data?.errorMessage ||
        err?.response?.data?.message ||
        err?.message ||
        'unknown';

      this.logger.error(`Cas getIdentity failed: ${casMessage}`);

      throw new BadRequestException(
        `Cas identity lookup failed: ${casMessage}`,
      );
    }
  }

  buildCasLinkUrl(grantToken: string, redirectUri: string, state?: string): string {
    let url = `${this.config.linkUrl}?grantToken=${encodeURIComponent(grantToken)}&redirectUri=${encodeURIComponent(redirectUri)}`;
    if (state) {
      url += `&state=${encodeURIComponent(state)}`;
    }
    return `${url}&iframe=false`;
  }
}
