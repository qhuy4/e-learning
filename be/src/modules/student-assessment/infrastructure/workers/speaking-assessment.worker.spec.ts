import {
  SpeakingAttemptRow,
  SpeakingProcessingError,
} from '@/modules/student-assessment/application/speaking-assessment.service';
import { SpeakingAssessmentWorker } from './speaking-assessment.worker';

function row(processingAttempts = 1): SpeakingAttemptRow {
  return {
    row_version: '101',
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
    processing_attempts: processingAttempts,
    next_attempt_at: new Date(),
    locked_at: new Date(),
    created_at: new Date(),
    updated_at: new Date(),
  };
}

describe('SpeakingAssessmentWorker', () => {
  it('claim job và giao cho service xử lý', async () => {
    const claimed = row();
    const dataSource = {
      query: jest.fn().mockResolvedValueOnce([[claimed], 1]),
    };
    const speaking = {
      processClaimedAttempt: jest.fn().mockResolvedValue(undefined),
    };
    const worker = new SpeakingAssessmentWorker(
      dataSource as never,
      speaking as never,
    );

    await worker.processQueue();

    expect(speaking.processClaimedAttempt).toHaveBeenCalledWith(claimed);
    expect(dataSource.query).toHaveBeenCalledWith(
      expect.stringContaining('FOR UPDATE SKIP LOCKED'),
      [4, 3, 2],
    );
  });

  it('retry với backoff khi cloud tạm lỗi', async () => {
    const claimed = row(2);
    const dataSource = {
      query: jest
        .fn()
        .mockResolvedValueOnce([[claimed], 1])
        .mockResolvedValueOnce([[], 0]),
    };
    const speaking = {
      processClaimedAttempt: jest
        .fn()
        .mockRejectedValue(
          new SpeakingProcessingError('TRANSCRIPTION', claimed),
        ),
    };
    const worker = new SpeakingAssessmentWorker(
      dataSource as never,
      speaking as never,
    );

    await worker.processQueue();

    expect(dataSource.query).toHaveBeenLastCalledWith(
      expect.stringContaining('next_attempt_at'),
      ['TRANSCRIPTION', false, 'TRANSCRIPTION_UNAVAILABLE', 20, 9, '101'],
    );
  });

  it('đánh dấu lỗi cuối cùng sau lần thử thứ tư', async () => {
    const claimed = row(4);
    const dataSource = {
      query: jest
        .fn()
        .mockResolvedValueOnce([[claimed], 1])
        .mockResolvedValueOnce([[], 0]),
    };
    const speaking = {
      processClaimedAttempt: jest
        .fn()
        .mockRejectedValue(new SpeakingProcessingError('ASSESSMENT', claimed)),
    };
    const worker = new SpeakingAssessmentWorker(
      dataSource as never,
      speaking as never,
    );

    await worker.processQueue();

    expect(dataSource.query).toHaveBeenLastCalledWith(
      expect.stringContaining("THEN 'FAILED'"),
      ['ASSESSMENT', true, 'ASSESSMENT_UNAVAILABLE', 80, 9, '101'],
    );
  });
});
