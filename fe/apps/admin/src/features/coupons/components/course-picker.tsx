import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { Button } from "@fe/components/ui/button";
import { Input } from "@fe/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@fe/components/ui/popover";
import { adminApi } from "@/shared/lib/axios";

interface CourseItem {
  id: string;
  title: string;
}

interface CoursePickerProps {
  value: string[];
  onChange: (ids: string[]) => void;
}

export function CoursePicker({ value, onChange }: CoursePickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["coupon-course-search", search],
    queryFn: async () => {
      const response = await adminApi.get("/courses/", {
        params: { page: 1, limit: 50, ...(search && { keyword: search }) },
      });
      return response.data?.data ?? [];
    },
    enabled: open,
  });

  const courses: CourseItem[] = (data ?? []).map((c: any) => ({ id: String(c.id), title: c.title }));

  const toggle = (id: string) => {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  };

  const selectedCourses = courses.filter((c) => value.includes(c.id));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button variant="outline" className="w-full justify-start font-normal" />
        }
      >
        {value.length > 0 ? (
          <span className="text-foreground">{value.length} khóa học đã chọn</span>
        ) : (
          <span className="text-muted-foreground">Chọn khóa học...</span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <div className="border-b p-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Tìm khóa học..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <div className="max-h-[300px] overflow-y-auto p-1">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Đang tải...</div>
          ) : courses.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Không tìm thấy khóa học</div>
          ) : (
            courses.map((course) => (
              <button
                key={course.id}
                type="button"
                onClick={() => toggle(course.id)}
                className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent ${
                  value.includes(course.id) ? "bg-accent" : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={value.includes(course.id)}
                  onChange={() => toggle(course.id)}
                  className="size-4"
                />
                <span className="truncate">{course.title}</span>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface SelectedCoursesProps {
  ids: string[];
  onRemove: (id: string) => void;
}

export function SelectedCourses({ ids, onRemove }: SelectedCoursesProps) {
  const { data } = useQuery({
    queryKey: ["coupon-courses", ids],
    queryFn: async () => {
      if (ids.length === 0) return [];
      const results = await Promise.all(
        ids.map(async (id) => {
          try {
            const response = await adminApi.get(`/courses/${id}`);
            const course = response.data?.data;
            return { id, title: course?.title ?? `#${id}` };
          } catch {
            return { id, title: `#${id}` };
          }
        }),
      );
      return results;
    },
    enabled: ids.length > 0,
  });

  const courses = (data ?? []) as { id: string; title: string }[];

  if (ids.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {courses.map((c) => (
        <span
          key={c.id}
          className="inline-flex items-center gap-1 rounded-md border bg-secondary px-2 py-0.5 text-xs"
        >
          <span className="max-w-[200px] truncate">{c.title}</span>
          <button
            type="button"
            onClick={() => onRemove(c.id)}
            className="size-3.5 rounded-full hover:bg-destructive/20"
          >
            <X className="size-3" />
          </button>
        </span>
      ))}
    </div>
  );
}
