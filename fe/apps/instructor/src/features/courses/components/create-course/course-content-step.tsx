import { useState } from "react";
import { toast } from "sonner";

import type { Course, Section } from "../../types/course.types";

import { Button } from "@fe/components/ui/button";
import { Input } from "@fe/components/ui/input";

import { Plus, ListTree } from "lucide-react";

interface CourseContentStepProps {
  data: Course;
  updateData: (data: Partial<Course>) => void;
}

export function CourseContentStep({
  data,
  updateData,
}: CourseContentStepProps) {
  const [newSectionTitle, setNewSectionTitle] = useState("");

  const sections = data.sections ?? [];

  const addSection = () => {
    const title = newSectionTitle.trim();

    if (!title) return;

    const newSection: Section = {
      id: `new_${Date.now()}`,
      title,
      description: "",
      position: sections.length + 1,
      lessons: [],
    };

    updateData({
      sections: [...sections, newSection],
    });

    setNewSectionTitle("");
    toast.success("Đã thêm chương mới!");
  };

  const removeSection = (sectionId: string) => {
    updateData({
      sections: sections.filter((s) => s.id !== sectionId),
    });
    toast.success("Đã xóa chương!");
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Chương trình học</h2>

        <p className="text-sm text-muted-foreground mt-1">
          Quản lý các chương và bài học trong khóa học.
        </p>
      </div>

      <div className="space-y-6 bg-card border border-border shadow-sm rounded-md p-6">
        <div className="flex gap-3 items-center bg-muted/20 p-2 rounded-md border border-border">
          <div className="relative flex-1">
            <div className="absolute left-3 top-3.5 text-muted-foreground">
              <ListTree className="w-4 h-4" />
            </div>

            <Input
              placeholder="Nhập tên chương mới..."
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  addSection();
                }
              }}
              className="h-11 pl-10 bg-background rounded-sm border-transparent focus-visible:ring-1 focus-visible:border-input shadow-sm"
            />
          </div>

          <Button
            onClick={addSection}
            className="h-11 shrink-0 px-6 rounded-sm shadow-sm bg-primary/90 hover:bg-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Thêm chương
          </Button>
        </div>

        <div className="space-y-4">
          {sections.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-12 border-2 border-dashed border-border rounded-lg">
              Chưa có chương học nào. Hãy thêm chương mới.
            </div>
          ) : (
            sections.map((section) => (
              <div
                key={section.id}
                className="border border-border rounded-md bg-background shadow-sm overflow-hidden"
              >
                <div className="flex items-center gap-3 p-4 bg-muted/30 border-b border-border">
                  <div className="flex-1 font-medium text-foreground">
                    {section.title}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSection(section.id)}
                    className="rounded-md text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    Xóa
                  </Button>
                </div>

                <div className="p-4">
                  {section.lessons && section.lessons.length > 0 ? (
                    <div className="space-y-2">
                      {section.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="flex items-center justify-between p-3 bg-muted/20 rounded-md"
                        >
                          <span className="text-sm">{lesson.title}</span>
                          <span className="text-xs text-muted-foreground capitalize">
                            {lesson.type}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground text-center py-4">
                      Chương này chưa có bài học nào.
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
