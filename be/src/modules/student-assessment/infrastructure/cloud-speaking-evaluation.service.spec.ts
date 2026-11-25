import { CloudSpeakingEvaluationService } from './cloud-speaking-evaluation.service';

function config(values: Record<string, string | undefined>) {
  return { get: jest.fn((key: string) => values[key]) };
}

describe('CloudSpeakingEvaluationService', () => {
  afterEach(() => jest.restoreAllMocks());

  it('kết hợp điểm ngôn ngữ từ Cloudflare với fluency minh bạch', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          result: {
            response: {
              grammarScore: 82,
              vocabularyScore: 76,
              grammarFeedback: 'Use past tense more consistently.',
              vocabularyFeedback: 'Add more precise verbs.',
            },
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );
    const service = new CloudSpeakingEvaluationService(
      config({
        CLOUDFLARE_ACCOUNT_ID: 'account-1',
        CLOUDFLARE_AI_API_TOKEN: 'token-1',
      }) as never,
    );
    const transcript =
      'I learned to cook last year because I wanted to make healthy food for my family. At first it was difficult, but I practised every weekend and watched careful demonstrations.';

    const result = await service.evaluate('B1', transcript, 30);

    expect(result).toMatchObject({
      grammarScore: 82,
      vocabularyScore: 76,
      wordCount: 30,
      wordsPerMinute: 60,
      fillerCount: 0,
    });
    expect(result.fluencyScore).toBeGreaterThan(0);
    expect(result.overallScore).toBeGreaterThan(0);
    expect(service.model).toBe(
      'cloudflare:@cf/meta/llama-3.3-70b-instruct-fp8-fast',
    );
    const body = (fetchMock.mock.calls[0][1] as RequestInit).body;
    expect(typeof body).toBe('string');
    const request = JSON.parse(body as string) as Record<string, unknown>;
    expect(request.response_format).toBeDefined();
  });

  it('đọc JSON string và chặn điểm ngoài khoảng 0–100', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          result: {
            response: JSON.stringify({
              grammarScore: 120,
              vocabularyScore: -5,
              grammarFeedback: 'Good.',
              vocabularyFeedback: 'Keep practising.',
            }),
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );
    const service = new CloudSpeakingEvaluationService(
      config({
        R2_ACCOUNT_ID: 'account-1',
        CLOUDFLARE_AI_API_TOKEN: 'token-1',
      }) as never,
    );

    const result = await service.evaluate('A1', 'I like my family.', 10);

    expect(result.grammarScore).toBe(100);
    expect(result.vocabularyScore).toBe(0);
  });

  it('không có cấu hình thì không gửi transcript đi đâu', async () => {
    const fetchMock = jest.spyOn(global, 'fetch');
    const service = new CloudSpeakingEvaluationService(config({}) as never);

    await expect(service.evaluate('B1', 'Hello world.', 5)).rejects.toThrow(
      'No speaking evaluation provider',
    );
    expect(service.model).toBe('unconfigured');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('không biến điểm null từ Cloudflare thành 0', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      Response.json({
        success: true,
        result: {
          response: {
            grammarScore: null,
            vocabularyScore: 75,
            grammarFeedback: 'Use complete sentences.',
            vocabularyFeedback: 'Try more precise verbs.',
          },
        },
      }),
    );
    const service = new CloudSpeakingEvaluationService(
      config({
        CLOUDFLARE_ACCOUNT_ID: 'account-1',
        CLOUDFLARE_AI_API_TOKEN: 'token-1',
      }) as never,
    );

    await expect(
      service.evaluate('A1', 'I like my family.', 10),
    ).rejects.toThrow('invalid feedback');
  });
});
