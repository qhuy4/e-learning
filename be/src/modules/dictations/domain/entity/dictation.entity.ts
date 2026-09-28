export class Dictation {
  id?: string;
  title: string;
  description: string | null;
  audioUrl: string;
  level: string;
  playLimit: number | null;
  createdBy: string | null;
  
  static create(props: Partial<Dictation>): Dictation {
    const e = new Dictation();
    Object.assign(e, props);
    return e;
  }
}
