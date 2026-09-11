export class DeleteInstructorCertificateCommand {
  constructor(
    public readonly userId: number,
    public readonly certificateId: number,
  ) {}
}
