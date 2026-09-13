export class GetInstructorCertificateByIdQuery {
  constructor(
    public readonly userId: number,
    public readonly certificateId: number,
  ) {}
}
