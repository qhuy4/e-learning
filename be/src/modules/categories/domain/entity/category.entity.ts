export interface CategoryProps {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  children?: CategoryProps[];
  courseCount?: number;
}

export class Category {
  private constructor(private readonly props: CategoryProps) {}

  static create(data: Omit<CategoryProps, 'id' | 'createdAt' | 'updatedAt'>) {
    return new Category({ ...data, id: 0, createdAt: null, updatedAt: null });
  }

  static restore(data: CategoryProps) {
    return new Category(data);
  }

  get id() { return this.props.id; }
  get name() { return this.props.name; }
  get slug() { return this.props.slug; }
  get parentId() { return this.props.parentId; }
  get createdAt() { return this.props.createdAt; }
  get updatedAt() { return this.props.updatedAt; }
  get children() { return this.props.children; }
  get courseCount() { return this.props.courseCount; }

  toPlain() {
    return { ...this.props };
  }
}
