import { BadGatewayException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import FormData from 'form-data';
import { OcrSpaceProvider } from './ocr-space.provider';

jest.mock('axios');

const mockedAxios = jest.mocked(axios);
const file = {
  buffer: Buffer.from('image'),
  size: 5,
  originalname: 'certificate.webp',
  mimetype: 'image/webp',
} as Express.Multer.File;

const success = {
  data: {
    OCRExitCode: 1,
    IsErroredOnProcessing: false,
    ParsedResults: [{ ParsedText: 'TOEIC 885', FileParseExitCode: 1 }],
  },
};

describe('OcrSpaceProvider', () => {
  const provider = new OcrSpaceProvider({
    get: jest.fn(() => 'test-key'),
  } as unknown as ConfigService);

  beforeEach(() => {
    mockedAxios.post.mockReset();
    (axios.isAxiosError as unknown as jest.Mock).mockImplementation(
      (error: { isAxiosError?: boolean }) => error?.isAxiosError === true,
    );
  });

  it('returns the first Engine 3 result without retrying', async () => {
    mockedAxios.post.mockResolvedValueOnce(success);

    await expect(provider.parse(file)).resolves.toMatchObject({
      rawText: 'TOEIC 885',
    });
    expect(mockedAxios.post.mock.calls).toHaveLength(1);
  });

  it('retries Engine 3 once without scale after a provider 5xx', async () => {
    mockedAxios.post
      .mockRejectedValueOnce({ isAxiosError: true, response: { status: 500 } })
      .mockResolvedValueOnce(success);

    await expect(provider.parse(file)).resolves.toMatchObject({
      rawText: 'TOEIC 885',
    });
    expect(mockedAxios.post.mock.calls).toHaveLength(2);
    const firstForm = mockedAxios.post.mock.calls[0][1] as FormData;
    const retryForm = mockedAxios.post.mock.calls[1][1] as FormData;
    expect(firstForm.getBuffer().toString()).toContain('true');
    expect(retryForm.getBuffer().toString()).toContain('false');
  });

  it('does not retry a non-transient 4xx response', async () => {
    mockedAxios.post.mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 400 },
    });

    await expect(provider.parse(file)).rejects.toThrow(BadGatewayException);
    expect(mockedAxios.post.mock.calls).toHaveLength(1);
  });
});
