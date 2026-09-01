import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import FormData from 'form-data';
import { firstValueFrom } from 'rxjs';
import { FptEkycConfig } from './fpt-ekyc.config';
import {
  FptEkycFaceLivenessResponse,
  FptEkycInitSessionResponse,
  FptEkycOcrResponse,
  ParsedOcrData,
} from './fpt-ekyc.types';

/**
 * Client tích hợp FPT.AI eKYC - luồng "cập nhật thông tin" (update information flow).
 * Tài liệu: https://docs-vision.fpt.ai/ekyc/III-integration/III-2-APIs/a-APIs%20of%20eKYC%20Flows/APIs-in-update-information-flow/
 *
 * Thứ tự gọi API bắt buộc:
 *   1. POST /session/init  -> lấy session-id
 *   2. POST /ocr           -> OCR CCCD/CMND (ảnh mặt trước + mặt sau)
 *   3. POST /face/liveness -> kiểm tra liveness + so khớp khuôn mặt (ảnh selfie)
 */
@Injectable()
export class FptEkycService {
  private readonly logger = new Logger(FptEkycService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly config: FptEkycConfig,
  ) {}

  private get commonHeaders() {
    return {
      'api-key': this.config.apiKey,
      'device-type': this.config.deviceType,
      lang: this.config.lang,
    };
  }

  /**
   * Bước 1: Khởi tạo phiên eKYC. Bắt buộc phải gọi trước, session-id trả về
   * phải được đính kèm trong mọi request tiếp theo của cùng 1 lượt xác thực.
   */
  async initSession(clientUuid?: string): Promise<string> {
    const url = `${this.config.baseUrl}/session/init`;

    const { data } = await firstValueFrom(
      this.httpService.post<FptEkycInitSessionResponse>(
        url,
        { memory: '', nfc_support: 'false' },
        {
          headers: {
            ...this.commonHeaders,
            'Content-Type': 'application/json',
            ...(clientUuid ? { client_uuid: clientUuid } : {}),
          },
        },
      ),
    );

    if (data.code !== '200' || !data['session-id']) {
      throw new Error(
        `FPT eKYC init_session thất bại: ${data.message ?? 'unknown error'}`,
      );
    }

    return data['session-id'];
  }

  /**
   * Bước 2: OCR CCCD/CMND. Ảnh mặt trước phải được gửi trước ảnh mặt sau
   * (đúng theo yêu cầu thứ tự field `files` của FPT).
   */
  async ocrIdentityCard(
    sessionId: string,
    frontImage: Buffer,
    backImage: Buffer,
  ): Promise<{ raw: FptEkycOcrResponse; parsed: ParsedOcrData; success: boolean }> {
    const url = `${this.config.baseUrl}/ocr`;

    const form = new FormData();
    form.append('files', frontImage, { filename: 'front.jpg' });
    form.append('files', backImage, { filename: 'back.jpg' });

    const { data } = await firstValueFrom(
      this.httpService.post<FptEkycOcrResponse>(url, form, {
        headers: {
          ...this.commonHeaders,
          ...form.getHeaders(),
          'session-id': sessionId,
          'document-type': 'idr', // idr = CCCD/CMND
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      }),
    );

    const success = data.errorCode === '0';
    const parsed: ParsedOcrData = {};
    if (success && Array.isArray(data.data)) {
      for (const field of data.data) {
        parsed[field.key] = field.value;
      }
    }

    return { raw: data, parsed, success };
  }

  /**
   * Bước 3: Kiểm tra liveness (chống giả mạo/ảnh chụp lại) và so khớp
   * khuôn mặt selfie với ảnh trên CCCD đã OCR ở bước 2.
   */
  async verifyFaceLiveness(
    sessionId: string,
    selfieImage: Buffer,
  ): Promise<{
    raw: FptEkycFaceLivenessResponse;
    isLive: boolean;
    isMatch: boolean;
    similarity: number;
  }> {
    const url = `${this.config.baseUrl}/face/liveness`;

    const form = new FormData();
    form.append('selfies', selfieImage, { filename: 'selfie.jpg' });

    const { data } = await firstValueFrom(
      this.httpService.post<FptEkycFaceLivenessResponse>(url, form, {
        headers: {
          ...this.commonHeaders,
          ...form.getHeaders(),
          'session-id': sessionId,
          auto: 'False',
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      }),
    );

    const isLive = data.liveness?.is_live === 'true';
    const isMatch = data.face_match?.isMatch === 'true';
    const similarity = Number(data.face_match?.similarity ?? 0) || 0;

    return { raw: data, isLive, isMatch, similarity };
  }

  /**
   * Chạy trọn 1 luồng xác thực: init session -> OCR -> face liveness.
   * Bất kỳ bước nào lỗi (network/lỗi hệ thống FPT) đều được bắt lại và
   * trả về success=false thay vì throw, để nghiệp vụ đăng ký giáo viên
   * có thể fallback sang "chờ admin xét duyệt thủ công" thay vì chặn
   * hoàn toàn người dùng.
   */
  async verifyIdentity(input: {
    identityFront: Buffer;
    identityBack: Buffer;
    selfie: Buffer;
    clientUuid?: string;
  }): Promise<{
    success: boolean;
    ocrVerified: boolean;
    faceVerified: boolean;
    ocrData: ParsedOcrData | null;
    faceData: Record<string, unknown> | null;
    errorMessage: string | null;
  }> {
    try {
      const sessionId = await this.initSession(input.clientUuid);

      const ocrResult = await this.ocrIdentityCard(
        sessionId,
        input.identityFront,
        input.identityBack,
      );

      if (!ocrResult.success) {
        return {
          success: false,
          ocrVerified: false,
          faceVerified: false,
          ocrData: null,
          faceData: null,
          errorMessage: ocrResult.raw.errorMessage || 'OCR thất bại',
        };
      }

      const faceResult = await this.verifyFaceLiveness(
        sessionId,
        input.selfie,
      );

      const faceVerified = faceResult.isLive && faceResult.isMatch;

      return {
        success: true,
        ocrVerified: true,
        faceVerified,
        ocrData: ocrResult.parsed,
        faceData: {
          isLive: faceResult.isLive,
          isMatch: faceResult.isMatch,
          similarity: faceResult.similarity,
          raw: faceResult.raw,
        },
        errorMessage: faceVerified
          ? null
          : faceResult.raw.message || 'Khuôn mặt không khớp với giấy tờ',
      };
    } catch (error) {
      this.logger.error(
        `Gọi FPT eKYC thất bại: ${(error as Error).message}`,
        (error as Error).stack,
      );
      return {
        success: false,
        ocrVerified: false,
        faceVerified: false,
        ocrData: null,
        faceData: null,
        errorMessage: `Không thể kết nối tới dịch vụ eKYC: ${
          (error as Error).message
        }`,
      };
    }
  }
}
