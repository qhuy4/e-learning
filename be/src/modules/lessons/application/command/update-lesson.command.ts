export class UpdateLessonCommand {
  constructor(
    public readonly id: number,
    public readonly data: {
      title?: string;
      type?: string;
      videoProvider?: string | null;
      videoSource?: string | null;
      duration?: number | null;
      content?: string | null;
      position?: number;
      status?: number;
      isPreview?: boolean;
    },
  ) {}
}
