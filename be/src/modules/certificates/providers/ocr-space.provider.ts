import {
  Injectable,
  BadGatewayException,
  Logger,
  PayloadTooLargeException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import FormData from 'form-data';

interface OcrSpacePage {
  ParsedText: string;
  FileParseExitCode: number;
  ErrorMessage?: string;
}

interface OcrSpaceResponse {
  ParsedResults?: OcrSpacePage[];
  OCRExitCode?: number;
  IsErroredOnProcessing?: boolean;
  ErrorMessage?: string | string[];
}

@Injectable()
export class OcrSpaceProvider {
  private readonly endpoint = 'https://api.ocr.space/parse/image';
  private readonly logger = new Logger(OcrSpaceProvider.name);

  constructor(private readonly config: ConfigService) {}

  async parse(
    file: Express.Multer.File,
  ): Promise<{ rawText: string; response: OcrSpaceResponse }> {
    if (!file?.buffer?.length) {
      throw new BadGatewayException('Certificate file is empty');
    }

    // Giới hạn gói free: 1 MiB/file.
    if (file.size > 1024 * 1024) {
      throw new PayloadTooLargeException(
        'File exceeds OCR.space free-plan limit of 1 MiB',
      );
    }

    const apiKey = this.config.get<string>('OCR_SPACE_API_KEY');
    if (!apiKey) {
      throw new Error('OCR_SPACE_API_KEY is not configured');
    }

    try {
      return await this.parseOnce(file, apiKey, true);
    } catch (error) {
      if (!this.isRetryable(error)) throw this.safeError(error);
      this.logger.warn(
        `OCR Engine 3 failed (${this.errorCode(error)}); retrying once without scale`,
      );
      try {
        return await this.parseOnce(file, apiKey, false);
      } catch (retryError) {
        throw this.safeError(retryError);
      }
    }
  }

  private async parseOnce(
    file: Express.Multer.File,
    apiKey: string,
    scale: boolean,
  ): Promise<{ rawText: string; response: OcrSpaceResponse }> {
    const form = new FormData();
    form.append('file', file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });
    form.append('OCREngine', '3');
    form.append('scale', String(scale));
    form.append('isOverlayRequired', 'false');

    const { data } = await axios.post<OcrSpaceResponse>(this.endpoint, form, {
      headers: {
        apikey: apiKey,
        ...form.getHeaders(),
      },
      timeout: 45_000,
      maxBodyLength: 2 * 1024 * 1024,
      maxContentLength: 2 * 1024 * 1024,
    });

    if (
      data.IsErroredOnProcessing ||
      data.OCRExitCode !== 1 ||
      !data.ParsedResults?.length
    ) {
      throw new BadGatewayException('OCR processing failed');
    }

    const pages = data.ParsedResults;

    if (pages.some((page) => page.FileParseExitCode !== 1)) {
      throw new BadGatewayException('OCR failed to parse a page');
    }

    const rawText = pages
      .map((page) => page.ParsedText ?? '')
      .filter((text) => text.trim().length > 0)
      .join('\n\n');

    if (!rawText) {
      throw new BadGatewayException('OCR returned empty text');
    }

    return { rawText, response: data };
  }

  private isRetryable(error: unknown): boolean {
    if (error instanceof BadGatewayException) return true;
    if (!axios.isAxiosError(error)) return false;
    return error.response == null || error.response.status >= 500;
  }

  private errorCode(error: unknown): string {
    if (axios.isAxiosError(error)) {
      return String(error.response?.status ?? error.code ?? 'network');
    }
    return error instanceof BadGatewayException ? 'parse' : 'unknown';
  }

  private safeError(error: unknown): BadGatewayException {
    if (error instanceof BadGatewayException) return error;
    // Không trả API key hoặc response nhạy cảm ra client.
    return new BadGatewayException(
      `Unable to process certificate with OCR provider (${this.errorCode(error)})`,
    );
  }
}
