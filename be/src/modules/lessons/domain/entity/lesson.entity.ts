export class Lesson {
  private constructor(
    public id: number | null,
    public sectionId: number,
    public title: string,
    public slug: string,
    public type: string,
    public videoProvider: string | null,
    public videoSource: string | null,
    public duration: number | null,
    public content: string | null,
    public position: number,
    public publishedAt: Date | null,
    public status: number,
    public isPreview: boolean,
    public createdAt: Date | null,
    public updatedAt: Date | null,
    public deletedAt: Date | null,
  ) {}

  static create(params: {
    sectionId: number;
    title: string;
    slug: string;
    type?: string;
    videoProvider?: string | null;
    videoSource?: string | null;
    duration?: number | null;
    content?: string | null;
    position?: number;
    status?: number;
    isPreview?: boolean;
  }): Lesson {
    return new Lesson(
      null,
      params.sectionId,
      params.title,
      params.slug,
      params.type ?? 'video',
      params.videoProvider ?? null,
      params.videoSource ?? null,
      params.duration ?? null,
      params.content ?? null,
      params.position ?? 0,
      null,
      params.status ?? 0,
      params.isPreview ?? false,
      null,
      null,
      null,
    );
  }

  static restore(params: {
    id: number;
    sectionId: number;
    title: string;
    slug: string;
    type: string;
    videoProvider: string | null;
    videoSource: string | null;
    duration: number | null;
    content: string | null;
    position: number;
    publishedAt: Date | null;
    status: number;
    isPreview: boolean;
    createdAt: Date | null;
    updatedAt: Date | null;
    deletedAt: Date | null;
  }): Lesson {
    return new Lesson(
      params.id,
      params.sectionId,
      params.title,
      params.slug,
      params.type,
      params.videoProvider,
      params.videoSource,
      params.duration,
      params.content,
      params.position,
      params.publishedAt,
      params.status,
      params.isPreview,
      params.createdAt,
      params.updatedAt,
      params.deletedAt,
    );
  }

  update(params: {
    title?: string;
    slug?: string;
    type?: string;
    videoProvider?: string | null;
    videoSource?: string | null;
    duration?: number | null;
    content?: string | null;
    position?: number;
    status?: number;
    isPreview?: boolean;
  }): void {
    if (params.title !== undefined) {
      this.title = params.title;
    }

    if (params.slug !== undefined) {
      this.slug = params.slug;
    }

    if (params.type !== undefined) {
      this.type = params.type;
    }

    if (params.videoProvider !== undefined) {
      this.videoProvider = params.videoProvider;
    }

    if (params.videoSource !== undefined) {
      this.videoSource = params.videoSource;
    }

    if (params.duration !== undefined) {
      this.duration = params.duration;
    }

    if (params.content !== undefined) {
      this.content = params.content;
    }

    if (params.position !== undefined) {
      this.position = params.position;
    }

    if (params.status !== undefined) {
      this.status = params.status;
    }

    if (params.isPreview !== undefined) {
      this.isPreview = params.isPreview;
    }
  }
  clone(sectionId: number): Lesson {
    return Lesson.create({
      sectionId,
      title: this.title,
      slug: this.slug,
      type: this.type,
      videoProvider: this.videoProvider,
      videoSource: this.videoSource,
      duration: this.duration,
      content: this.content,
      position: this.position,
      status: this.status,
      isPreview: this.isPreview,
    });
  }
}
