import { calculateCourseProgress } from './update-lesson-progress.handler';

describe('calculateCourseProgress', () => {
  it('completes a course when every lesson is complete even without durations', () => {
    expect(
      calculateCourseProgress(
        [
          { watchSeconds: 0, isCompleted: true },
          { watchSeconds: 0, isCompleted: true },
        ],
        [{ duration: null }, { duration: null }],
      ),
    ).toEqual({ progress: 100, courseCompleted: true });
  });

  it('never reports 100 before all lessons are complete', () => {
    expect(
      calculateCourseProgress(
        [{ watchSeconds: 100, isCompleted: true }],
        [{ duration: 50 }, { duration: 50 }],
      ).progress,
    ).toBe(99);
  });
});
