import { CertificateStatus } from '../domain/enum/certificate-status.enum';
import { AdminInstructorCertificatesController } from './admin-instructor-certificates.controller';

jest.mock('@/common/guards/jwt-auth.guard', () => ({
  JwtAuthGuard: class JwtAuthGuard {},
}));

describe('AdminInstructorCertificatesController assessment triggers', () => {
  const certificate = {
    id: 7,
    userId: 12,
    certificateStatus: CertificateStatus.PENDING,
    reviewedBy: null,
    reviewedAt: null,
    rejectReason: null,
  };

  function harness() {
    const entity = { ...certificate };
    const certRepo = {
      findOne: jest.fn(() => entity),
      save: jest.fn(() => entity),
    };
    const assessmentRuns = {
      onEvidenceChangedForUser: jest.fn(),
    };
    const controller = new AdminInstructorCertificatesController(
      certRepo as never,
      {} as never,
      assessmentRuns as never,
    );
    return { controller, assessmentRuns };
  }

  it.each([
    [
      'approval',
      (controller: AdminInstructorCertificatesController) =>
        controller.approve(7, 1),
    ],
    [
      'rejection',
      (controller: AdminInstructorCertificatesController) =>
        controller.reject(7, 'invalid', 1),
    ],
  ])('recalculates after standalone %s', async (_name, mutate) => {
    const { controller, assessmentRuns } = harness();
    await mutate(controller);
    expect(assessmentRuns.onEvidenceChangedForUser).toHaveBeenCalledWith(12);
  });
});
