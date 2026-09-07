import { Search } from "lucide-react";
import { Input } from "@fe/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@fe/components/ui/select";

interface CourseFilterBarProps {
  keyword: string;
  level: string;
  status: string;
  onKeywordChange: (v: string) => void;
  onLevelChange: (v: string) => void;
  onStatusChange: (v: string) => void;
}

export function CourseFilterBar({
  keyword,
  level,
  status,
  onKeywordChange,
  onLevelChange,
  onStatusChange,
}: CourseFilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center bg-card p-4 rounded-xl border border-border shadow-sm">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Tìm kiếm theo tên khóa học..."
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          className="pl-9 h-10"
        />
      </div>

      <Select value={level} onValueChange={(v) => onLevelChange(v ?? "")}>
        <SelectTrigger className="h-10 min-w-[160px]">
          <SelectValue placeholder="Tất cả cấp độ" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Tất cả cấp độ</SelectItem>
          <SelectItem value="1">Cơ bản</SelectItem>
          <SelectItem value="2">Trung bình</SelectItem>
          <SelectItem value="3">Nâng cao</SelectItem>
        </SelectContent>
      </Select>

      <Select value={status} onValueChange={(v) => onStatusChange(v ?? "")}>
        <SelectTrigger className="h-10 min-w-[160px]">
          <SelectValue placeholder="Tất cả trạng thái" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Tất cả trạng thái</SelectItem>
          <SelectItem value="1">Bản nháp</SelectItem>
          <SelectItem value="2">Chờ duyệt</SelectItem>
          <SelectItem value="3">Đã duyệt</SelectItem>
          <SelectItem value="4">Bị từ chối</SelectItem>
          <SelectItem value="5">Đã xuất bản</SelectItem>
          <SelectItem value="6">Lưu trữ</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
