import { useState } from "react";
import { toast } from "sonner";

import type { Course, Section } from "../../types/course.types";

import { Button } from "@fe/components/ui/button";
import { Input } from "@fe/components/ui/input";

import { Plus, ListTree } from "lucide-react";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import type { DragEndEvent } from "@dnd-kit/core";

import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { SortableSection } from "./sortable-section"; 

import { useCreateSection, useUpdateSection } from "../../hooks/use-courses";
import { validateSection } from "../../schemas/section.schema";

interface CourseContentStepProps {
  data: Course;
  updateData: (data: Partial<Course>) => void;
  readOnly?: boolean;
}

export function CourseContentStep({
  data,
  updateData,
  readOnly = false,
}: CourseContentStepProps) {
  const [newSectionTitle, setNewSectionTitle] = useState("");

  const sections = data.sections ?? [];

  const { mutate: createSection, isPending } = useCreateSection();
  const { mutateAsync: updateSection } = useUpdateSection();

  const addSection = () => {
    const title = newSectionTitle.trim();
    const error = validateSection({ title });
    if (error) {
      toast.error(error);
      return;
    }

    if (!data.id) {
      alert("Không tìm thấy ID khóa học.");
      return;
    }

    const section: Omit<Section, "id"> = {
      title,
      description: "",
      position: sections.length + 1,
      lessons: [],
    };

    createSection(
      {
        courseId: Number(data.id),
        section,
      },
      {
        onSuccess: (newSection) => {
          updateData({
            sections: [
              ...sections,
              {
                ...newSection,
                lessons: newSection.lessons ?? [],
              },
            ],
          });

          setNewSectionTitle("");
        },

        onError: (error) => {
          console.error("Lỗi khi tạo section:", error);
          toast.error("Có lỗi xảy ra khi tạo chương.");
        },
      },
    );
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = sections.findIndex(
      (section) => String(section.id) === String(active.id),
    );

    const newIndex = sections.findIndex(
      (section) => String(section.id) === String(over.id),
    );

    if (oldIndex === -1 || newIndex === -1) return;

    const newSections = arrayMove(sections, oldIndex, newIndex);

    updateData({
      sections: newSections,
    });

    try {
      await Promise.all(
        newSections.map((section, index) =>
          updateSection({
            courseId: Number(data.id),
            sectionId: Number(section.id),
            section: { position: index + 1 },
          })
        )
      );
    } catch (error) {
      console.error("Lỗi khi cập nhật vị trí chương học:", error);
      toast.error("Có lỗi xảy ra khi thay đổi vị trí chương học.");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Chương trình học</h2>

        <p className="text-sm text-muted-foreground mt-1">
          Sắp xếp các chương và bài học. Kéo thả để thay đổi vị trí của chương.
        </p>
      </div>

      <div className="space-y-6 bg-card border border-border shadow-sm rounded-md p-6">
        {!readOnly && (
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
              disabled={isPending}
              className="h-11 shrink-0 px-6 rounded-sm shadow-sm bg-primary/90 hover:bg-primary"
            >
              <Plus className="h-4 w-4 mr-2" />

              {isPending ? "Đang thêm..." : "Thêm chương"}
            </Button>
          </div>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sections.map((section) => String(section.id))}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-5">
              {sections.map((section) => (
                <SortableSection
                  key={section.id}
                  section={section}
                  data={data}
                  updateData={updateData}
                  courseId={data.id}
                  readOnly={readOnly}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
