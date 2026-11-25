import {
  SpeakingAssessmentService,
  SpeakingProcessingError,
} from './speaking-assessment.service';

const NOW = new Date('2026-11-24T08:00:00Z');

function row(overrides: Record<string, unknown> = {}) {
  return {
    row_version: '100',
    id: 9,
    user_id: 47,
    prompt_id: 'b1-learning',
    level: 'B1',
    duration_seconds: 42,
    audio_key: 'student-assessments/speaking/47/test.webm',
    audio_mime_type: 'audio/webm',
    audio_size: 100,
    transcript: null,
    transcription_status: 'PROCESSING',
    transcription_model: 'gpt-transcribe',
    transcription_error: null,
    assessment_status: 'PENDING',
    grammar_score: null,
    vocabulary_score: null,
    fluency_score: null,
    overall_score: null,
    assessment_feedback: null,
    assessment_model: 'cloudflare:test-model',
    assessment_error: null,
    processing_attempts: 0,
    next_attempt_at: NOW,
    locked_at: null,
    created_at: NOW,
    updated_at: NOW,
    ...overrides,
  };
}

function updated(...rows: ReturnType<typeof row>[]) {
  return [rows, rows.length];
}

function makeService() {
  const dataSource = { query: jest.fn() };
  const profile = {
    resolveAssessmentLevel: jest
      .fn()
      .mockResolvedValue({ level: 'B1', basis: 'self_assessment' }),
  };
  const transcription = {
    model: 'gpt-transcribe',
    transcribe: jest.fn().mockResolvedValue('I learned to cook last year.'),
  };
  const evaluation = {
    model: 'cloudflare:test-model',
    evaluate: jest.fn().mockResolvedValue({
      grammarScore: 80,
      vocabularyScore: 75,
      fluencyScore: 70,
      overallScore: 75,
      grammarFeedback: 'Grammar feedback.',
      vocabularyFeedback: 'Vocabulary feedback.',
      fluencyFeedback: 'Fluency feedback.',
      wordCount: 28,
      wordsPerMinute: 68,
      fillerCount: 1,
    }),
  };
  const storage = {
    upload: jest.fn().mockResolvedValue(undefined),
    delete: jest.fn().mockResolvedValue(undefined),
    createDownloadUrl: jest.fn().mockResolvedValue('https://signed.test/audio'),
  };
  const service = new SpeakingAssessmentService(
    dataSource as never,
    profile as never,
    transcription as never,
    evaluation as never,
    storage as never,
  );
  return { service, dataSource, transcription, evaluation, storage };
}

const file = {
  buffer: Buffer.from('audio'),
  size: 5,
  mimetype: 'audio/webm;codecs=opus',
  originalname: 'recording.webm',
} as Express.Multer.File;

describe('SpeakingAssessmentService', () => {
  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(NOW.getTime());
  });

  afterEach(() => jest.restoreAllMocks());

  it('trả đề đúng level tự đánh giá', async () => {
    const { service } = makeService();
    await expect(service.prompt(47)).resolves.toMatchObject({
      level: 'B1',
      selectionBasis: 'self_assessment',
    });
  });

  it('upload và trả attempt ngay mà không chờ cloud', async () => {
    const { service, dataSource, storage, transcription, evaluation } =
      makeService();
    dataSource.query.mockResolvedValueOnce([row()]);

    await expect(
      service.submit(
        47,
        { promptId: 'b1-learning', durationSeconds: 42 },
        file,
      ),
    ).resolves.toMatchObject({
      attemptId: 9,
      transcriptionStatus: 'PROCESSING',
      assessmentStatus: 'PENDING',
      canRetry: false,
    });

    expect(storage.upload).toHaveBeenCalled();
    expect(transcription.transcribe).not.toHaveBeenCalled();
    expect(evaluation.evaluate).not.toHaveBeenCalled();
  });

  it('xóa audio nếu không tạo được job trong database', async () => {
    const { service, dataSource, storage } = makeService();
    dataSource.query.mockRejectedValueOnce(new Error('database unavailable'));

    await expect(
      service.submit(
        47,
        { promptId: 'b1-learning', durationSeconds: 42 },
        file,
      ),
    ).rejects.toThrow('database unavailable');
    expect(storage.delete).toHaveBeenCalledTimes(1);
  });

  it('worker tạo transcript rồi đánh giá với stale-run protection', async () => {
    const { service, dataSource, transcription, evaluation } = makeService();
    const claimed = row({ processing_attempts: 1, locked_at: NOW });
    const transcribed = row({
      row_version: '101',
      processing_attempts: 1,
      transcript: 'I learned to cook last year.',
      transcription_status: 'COMPLETED',
      assessment_status: 'PROCESSING',
      locked_at: NOW,
    });
    dataSource.query
      .mockResolvedValueOnce(updated(transcribed))
      .mockResolvedValueOnce(updated(row({ row_version: '102' })));
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(new Response(Buffer.from('audio'), { status: 200 }));

    await service.processClaimedAttempt(claimed as never);

    expect(transcription.transcribe).toHaveBeenCalledTimes(1);
    expect(evaluation.evaluate).toHaveBeenCalledWith(
      'B1',
      'I learned to cook last year.',
      42,
    );
    expect(dataSource.query).toHaveBeenLastCalledWith(
      expect.stringContaining('xmin = $7::xid'),
      [80, 75, 70, 75, expect.any(String), 9, '101'],
    );
  });

  it('phân loại đúng lỗi cloud để worker lên lịch retry', async () => {
    const { service, transcription } = makeService();
    transcription.transcribe.mockRejectedValueOnce(new Error('unavailable'));
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(new Response(Buffer.from('audio'), { status: 200 }));

    await expect(
      service.processClaimedAttempt(
        row({ processing_attempts: 1, locked_at: NOW }) as never,
      ),
    ).rejects.toMatchObject<SpeakingProcessingError>({
      stage: 'TRANSCRIPTION',
    });
  });

  it('retry chỉ đưa job về hàng đợi, không gọi cloud đồng bộ', async () => {
    const { service, dataSource, transcription, evaluation } = makeService();
    dataSource.query
      .mockResolvedValueOnce([
        row({
          transcript: 'I learned to cook last year.',
          transcription_status: 'COMPLETED',
          assessment_status: 'FAILED',
        }),
      ])
      .mockResolvedValueOnce(
        updated(
          row({
            row_version: '101',
            transcript: 'I learned to cook last year.',
            transcription_status: 'COMPLETED',
            assessment_status: 'PENDING',
          }),
        ),
      );

    await expect(service.retry(47, 9)).resolves.toMatchObject({
      assessmentStatus: 'PENDING',
      canRetry: false,
    });
    expect(transcription.transcribe).not.toHaveBeenCalled();
    expect(evaluation.evaluate).not.toHaveBeenCalled();
  });

  it('từ chối đề không khớp level hiện tại trước khi upload', async () => {
    const { service, storage } = makeService();
    await expect(
      service.submit(47, { promptId: 'a2-weekend', durationSeconds: 30 }, file),
    ).rejects.toThrow('không khớp level');
    expect(storage.upload).not.toHaveBeenCalled();
  });
});
