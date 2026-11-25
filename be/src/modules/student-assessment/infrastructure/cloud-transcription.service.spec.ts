import { CloudTranscriptionService } from './cloud-transcription.service';

function config(values: Record<string, string | undefined>) {
  return {
    get: jest.fn((key: string) => values[key]),
  };
}

describe('CloudTranscriptionService', () => {
  afterEach(() => jest.restoreAllMocks());

  it('ưu tiên Cloudflare Workers AI khi có token', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          result: { text: ' Hello from Cloudflare. ' },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );
    const service = new CloudTranscriptionService(
      config({
        R2_ACCOUNT_ID: 'account-1',
        CLOUDFLARE_AI_API_TOKEN: 'token-1',
        OPENAI_API_KEY: 'openai-fallback',
      }) as never,
    );

    const text = await service.transcribe(
      Buffer.from('audio'),
      'audio/webm',
      'speaking.webm',
    );

    expect(text).toBe('Hello from Cloudflare.');
    expect(service.model).toBe('cloudflare:@cf/openai/whisper');
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.cloudflare.com/client/v4/accounts/account-1/ai/run/@cf/openai/whisper',
      expect.objectContaining({
        method: 'POST',
        headers: {
          Authorization: 'Bearer token-1',
          'Content-Type': 'audio/webm',
        },
      }),
    );
  });

  it('chỉ dùng OpenAI fallback khi Cloudflare chưa được cấu hình', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ text: 'Fallback transcript.' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    const service = new CloudTranscriptionService(
      config({ OPENAI_API_KEY: 'openai-key' }) as never,
    );

    const text = await service.transcribe(
      Buffer.from('audio'),
      'audio/webm',
      'speaking.webm',
    );

    expect(text).toBe('Fallback transcript.');
    expect(service.model).toBe('openai:gpt-transcribe');
    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://api.openai.com/v1/audio/transcriptions',
    );
  });

  it('không cấu hình provider → không gửi audio đi đâu', async () => {
    const fetchMock = jest.spyOn(global, 'fetch');
    const service = new CloudTranscriptionService(config({}) as never);

    await expect(
      service.transcribe(Buffer.from('audio'), 'audio/webm', 'speaking.webm'),
    ).rejects.toThrow('No transcription provider');
    expect(service.model).toBe('unconfigured');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
