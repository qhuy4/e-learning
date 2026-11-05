import {
  InstructorApplicationsService,
  validateReviewedCertificateOcr,
} from './instructor-applications.service';

describe('InstructorApplicationsService multi-certificate OCR', () => {
  it('runs OCR sequentially when multiple certificates are submitted', async () => {
    let finishFirstOcr!: (value: { rawText: string }) => void;
    const firstOcr = new Promise<{ rawText: string }>((resolve) => {
      finishFirstOcr = resolve;
    });
    const transactionError = new Error('stop after OCR');
    const parse = jest
      .fn()
      .mockImplementationOnce(() => firstOcr)
      .mockResolvedValueOnce({ rawText: 'TOEIC 885' });

    const service = new InstructorApplicationsService(
      { transaction: jest.fn().mockRejectedValue(transactionError) } as never,
      {} as never,
      {} as never,
      {
        resolve: jest.fn().mockResolvedValue({ applicationId: 7 }),
      } as never,
      {} as never,
      { upload: jest.fn().mockResolvedValue(undefined) } as never,
      { parse } as never,
      {} as never,
      {} as never,
      {} as never,
    );

    const file = (name: string): Express.Multer.File =>
      ({
        fieldname: 'files',
        originalname: name,
        encoding: '7bit',
        mimetype: 'image/webp',
        size: 3,
        buffer: Buffer.from('webp'),
      }) as Express.Multer.File;

    const submission = service.submitByToken({ token: 'token' } as never, [
      file('ielts.webp'),
      file('toeic.webp'),
    ]);

    await new Promise((resolve) => setImmediate(resolve));
    expect(parse).toHaveBeenCalledTimes(1);
    expect(parse).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ originalname: 'ielts.webp' }),
    );

    finishFirstOcr({ rawText: 'IELTS 9.0' });

    await expect(submission).rejects.toBe(transactionError);
    expect(parse).toHaveBeenCalledTimes(2);
    expect(parse).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ originalname: 'toeic.webp' }),
    );
  });

  it('rejects incomplete IELTS data before certificate approval', () => {
    expect(() =>
      validateReviewedCertificateOcr({
        documentType: 'IELTS_TRF',
        overall: 9,
        listening: 9,
        reading: 9,
      }),
    ).toThrow('Dữ liệu không hợp lệ');
  });

  it('accepts complete TOEIC data within its score ranges', () => {
    expect(() =>
      validateReviewedCertificateOcr({
        documentType: 'TOEIC',
        overall: 885,
        listening: 435,
        reading: 450,
      }),
    ).not.toThrow();
  });
});
