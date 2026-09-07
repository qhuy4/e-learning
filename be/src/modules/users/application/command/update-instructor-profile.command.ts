export class UpdateInstructorProfileCommand {
  constructor(
    public readonly userId: number,
    public readonly data: {
      name?: string;
      profile?: {
        firstName?: string;
        lastName?: string;
        phone?: string;
        gender?: number;
        dateOfBirth?: string;
        occupation?: string;
        address?: string;
        city?: string;
        country?: string;
        bio?: string;
      };
      avatar?: Express.Multer.File;
    },
  ) {}
}
