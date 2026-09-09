export class UpdateInstructorCommand {
  constructor(
    public readonly data: {
      id: number;
      name?: string;
      email?: string;
      status?: string;
      headline?: string;
      bio?: string;
      websiteUrl?: string;
      socialLinks?: Record<string, string>;
    },
  ) {}
}
