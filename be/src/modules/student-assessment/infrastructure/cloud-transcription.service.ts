import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CloudTranscriptionService {
  readonly model: string;
  private readonly cloudflareAccountId: string | undefined;
  private readonly cloudflareToken: string | undefined;
  private readonly cloudflareModel: string;
  private readonly openAiKey: string | undefined;
  private readonly openAiModel: string;
  private readonly openAiBaseUrl: string;

  constructor(config: ConfigService) {
    this.cloudflareAccountId =
      config.get<string>('CLOUDFLARE_ACCOUNT_ID') ??
      config.get<string>('R2_ACCOUNT_ID');
    this.cloudflareToken = config.get<string>('CLOUDFLARE_AI_API_TOKEN');
    this.cloudflareModel =
      config.get<string>('CLOUDFLARE_AI_TRANSCRIPTION_MODEL') ??
      '@cf/openai/whisper';
    this.openAiKey = config.get<string>('OPENAI_API_KEY');
    this.openAiModel =
      config.get<string>('OPENAI_TRANSCRIPTION_MODEL') ?? 'gpt-transcribe';
    this.openAiBaseUrl = (
      config.get<string>('OPENAI_BASE_URL') ?? 'https://api.openai.com/v1'
    ).replace(/\/$/, '');
    this.model =
      this.cloudflareAccountId && this.cloudflareToken
        ? `cloudflare:${this.cloudflareModel}`
        : this.openAiKey
          ? `openai:${this.openAiModel}`
          : 'unconfigured';
  }

  async transcribe(
    audio: Buffer,
    mimeType: string,
    fileName: string,
  ): Promise<string> {
    if (this.cloudflareAccountId && this.cloudflareToken) {
      return this.transcribeWithCloudflare(audio, mimeType);
    }
    if (this.openAiKey) {
      return this.transcribeWithOpenAi(audio, mimeType, fileName);
    }
    throw new Error('No transcription provider is configured');
  }

  private async transcribeWithCloudflare(
    audio: Buffer,
    mimeType: string,
  ): Promise<string> {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${this.cloudflareAccountId}/ai/run/${this.cloudflareModel}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.cloudflareToken}`,
          'Content-Type': mimeType,
        },
        body: new Uint8Array(audio),
        signal: AbortSignal.timeout(60_000),
      },
    );
    if (!response.ok) {
      throw new Error(`Cloudflare transcription failed (${response.status})`);
    }
    const payload = (await response.json()) as {
      result?: { text?: unknown };
      success?: boolean;
    };
    const text =
      typeof payload.result?.text === 'string'
        ? payload.result.text.trim()
        : '';
    if (!payload.success || !text) {
      throw new Error('Cloudflare transcription returned empty text');
    }
    return text;
  }

  private async transcribeWithOpenAi(
    audio: Buffer,
    mimeType: string,
    fileName: string,
  ): Promise<string> {
    const form = new FormData();
    form.append('model', this.openAiModel);
    form.append(
      'file',
      new Blob([new Uint8Array(audio)], { type: mimeType }),
      fileName,
    );
    const response = await fetch(`${this.openAiBaseUrl}/audio/transcriptions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.openAiKey}` },
      body: form,
      signal: AbortSignal.timeout(60_000),
    });
    if (!response.ok) {
      throw new Error(`OpenAI transcription failed (${response.status})`);
    }
    const result = (await response.json()) as { text?: unknown };
    const text = typeof result.text === 'string' ? result.text.trim() : '';
    if (!text) throw new Error('OpenAI transcription returned empty text');
    return text;
  }
}
