/** Response của POST /session/init (hoặc /init_session) */
export interface FptEkycInitSessionResponse {
  code: string;
  message: string;
  'session-id': string;
  expires_at?: number;
}

/** 1 field dữ liệu trong kết quả OCR (mỗi field ứng với 1 trường trên CCCD) */
export interface FptEkycOcrField {
  key: string;
  name: string;
  value: string;
  score: string;
  locale: string;
}

/** Response của POST /ocr */
export interface FptEkycOcrResponse {
  errorCode: string;
  errorMessage: string;
  data: FptEkycOcrField[];
  total_data?: unknown[];
}

/** Response của POST /face/liveness */
export interface FptEkycFaceLivenessResponse {
  code: string;
  message: string;
  liveness: {
    code: string;
    message: string;
    is_live: string; // "true" | "false"
    spoof_prob: string;
  };
  face_match: {
    code: string;
    message: string;
    isMatch: string; // "true" | "false" | "N/A"
    similarity: string; // "0" -> "100"
  };
  is_complete_session: boolean;
}

/** Kết quả OCR đã được rút gọn thành object dễ dùng: { ID: '...', Name: '...' } */
export type ParsedOcrData = Record<string, string>;
