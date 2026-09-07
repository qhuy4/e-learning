export interface Lesson {
  sectionId: number;
  title: string;
  type: "video" | "document" | "quiz";
  duration: number;
  position: number;
  isPreview: boolean;
  content: string;
  videoSource?: File | string;
  thumbnail?: File | string;
}
