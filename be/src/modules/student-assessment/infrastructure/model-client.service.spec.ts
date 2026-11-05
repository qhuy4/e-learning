import { HttpStatus } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { ModelClientService } from './model-client.service';
import { ErrorCode } from '@/common/enum/error-code.enum';

/**
 * Test vocabForm/vocabScore — hợp đồng với model service (/vocab/form,
 * /vocab/score) bằng HttpService mock: không cần service model thật.
 */

const BASE = 'http://model:8020';

function serviceWith(http: {
  get: jest.Mock;
  post: jest.Mock;
}): ModelClientService {
  const config = { get: jest.fn().mockReturnValue(BASE) };
  return new ModelClientService(http as never, config as never);
}

const okHttp = () => ({
  get: jest.fn().mockReturnValue(of({ data: { form_seed: 1 } })),
  post: jest.fn().mockReturnValue(of({ data: { raw_score: 1, total: 1 } })),
});

const scorePayload = {
  raw_score: 24,
  total: 30,
  per_band: [{ band: 'A1', correct: 5, total: 5 }],
  band: 'C1',
  band_source: 'rasch',
  ability: { theta: 3.3354, se: 0.6221, model: 'rasch-1pl' },
  calibration: { n_respondents: 50 },
  provisional_band: 'C2',
  calibrated: true,
  note: 'band from Rasch ability estimate + calibrated cuts',
};

describe('ModelClientService.vocabForm', () => {
  it('GET {base}/vocab/form và truyền seed khi có', async () => {
    const http = okHttp();
    http.get.mockReturnValue(of({ data: { form_seed: 12345, items: [] } }));

    const res = await serviceWith(http).vocabForm(12345);

    expect(http.get).toHaveBeenCalledWith(
      `${BASE}/vocab/form`,
      expect.objectContaining({ params: { seed: 12345 } }),
    );
    expect(res.form_seed).toBe(12345);
  });

  it('model sập → MODEL_SERVICE_UNAVAILABLE (503), không giả lập form', async () => {
    const http = okHttp();
    http.get.mockReturnValue(throwError(() => new Error('ECONNREFUSED')));

    await expect(serviceWith(http).vocabForm()).rejects.toMatchObject({
      code: ErrorCode.MODEL_SERVICE_UNAVAILABLE,
      statusCode: HttpStatus.SERVICE_UNAVAILABLE,
    });
  });
});

describe('ModelClientService.vocabScore', () => {
  it('POST {base}/vocab/score với body nguyên vẹn', async () => {
    const http = okHttp();
    http.post.mockReturnValue(of({ data: scorePayload }));

    const payload = {
      student: 'user-47',
      form_seed: 12345,
      responses: [{ item_id: 'A1-02', answer: 'like' }],
    };
    const res = await serviceWith(http).vocabScore(payload);

    expect(http.post).toHaveBeenCalledWith(
      `${BASE}/vocab/score`,
      payload,
      expect.objectContaining({ timeout: 20000 }),
    );
    expect(res).toEqual(scorePayload);
  });

  it('model trả 422 (item lạ/trùng/không đúng options) → VALIDATION_ERROR 422', async () => {
    const http = okHttp();
    http.post.mockReturnValue(
      throwError(() => ({
        response: { status: 422, data: { detail: 'duplicate item_id' } },
      })),
    );

    await expect(
      serviceWith(http).vocabScore({
        form_seed: 1,
        responses: [{ item_id: 'A1-02', answer: 'x' }],
      }),
    ).rejects.toMatchObject({
      code: ErrorCode.VALIDATION_ERROR,
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    });
  });

  it('model không kết nối được → MODEL_SERVICE_UNAVAILABLE 503', async () => {
    const http = okHttp();
    http.post.mockReturnValue(
      throwError(() => ({ response: { status: 503 } })),
    );

    await expect(
      serviceWith(http).vocabScore({
        form_seed: 1,
        responses: [{ item_id: 'A1-02', answer: 'x' }],
      }),
    ).rejects.toMatchObject({
      code: ErrorCode.MODEL_SERVICE_UNAVAILABLE,
      statusCode: HttpStatus.SERVICE_UNAVAILABLE,
    });
  });
});
