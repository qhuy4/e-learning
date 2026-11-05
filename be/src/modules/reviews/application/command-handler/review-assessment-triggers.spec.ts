import { CreateReviewCommand } from '../command/create-review.command';
import { DeleteReviewCommand } from '../command/delete-review.command';
import { UpdateReviewStatusCommand } from '../command/update-review-status.command';
import { CreateReviewHandler } from './create-review.handler';
import { DeleteReviewHandler } from './delete-review.handler';
import { UpdateReviewStatusHandler } from './update-review-status.handler';

describe('review assessment triggers', () => {
  const review = { id: '9', userId: '3', courseId: '44', rating: 5 };

  it('recalculates after an eligible review create or update', async () => {
    const repository = { createOrUpdateReview: jest.fn(() => review) };
    const enrollments = { existsActiveByUserAndCourse: jest.fn(() => true) };
    const runs = { onEvidenceChangedForCourse: jest.fn() };
    const handler = new CreateReviewHandler(
      repository as never,
      enrollments as never,
      runs as never,
    );

    await handler.execute(new CreateReviewCommand('3', '44', 5));

    expect(runs.onEvidenceChangedForCourse).toHaveBeenCalledWith('44');
  });

  it('recalculates after review deletion', async () => {
    const repository = {
      findById: jest.fn(() => review),
      deleteReview: jest.fn(() => true),
    };
    const runs = { onEvidenceChangedForCourse: jest.fn() };
    const handler = new DeleteReviewHandler(repository as never, runs as never);

    await handler.execute(new DeleteReviewCommand('9', '3'));

    expect(runs.onEvidenceChangedForCourse).toHaveBeenCalledWith('44');
  });

  it('recalculates after moderation changes review eligibility', async () => {
    const repository = {
      findById: jest.fn(() => review),
      updateStatus: jest.fn(() => ({ ...review, status: 0 })),
    };
    const runs = { onEvidenceChangedForCourse: jest.fn() };
    const handler = new UpdateReviewStatusHandler(
      repository as never,
      runs as never,
    );

    await handler.execute(
      new UpdateReviewStatusCommand({ id: '9', status: 0 }),
    );

    expect(runs.onEvidenceChangedForCourse).toHaveBeenCalledWith('44');
  });
});
