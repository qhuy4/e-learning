import { Search } from "lucide-react";
import { Input } from "@fe/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@fe/components/ui/select";

interface AdminCourseFilterBarProps {
  keyword: string;
  level: string;
  status: string;
  onKeywordChange: (v: string) => void;
  onLevelChange: (v: string) => void;
  onStatusChange: (v: string) => void;
}

export function AdminCourseFilterBar({
  keyword,
  level,
  status,
  onKeywordChange,
  onLevelChange,
  onStatusChange,
}: AdminCourseFilterBarProps) {
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

      <Select value={level} onValueChange={onLevelChange}>
        <SelectTrigger className="h-10 min-w-[160px]">
          <SelectValue placeholder="Tất cả cấp độ">
            {level === "1" ? "Cơ bản" : level === "2" ? "Trung bình" : level === "3" ? "Nâng cao" : "Tất cả cấp độ"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả cấp độ</SelectItem>
          <SelectItem value="1">Cơ bản</SelectItem>
          <SelectItem value="2">Trung bình</SelectItem>
          <SelectItem value="3">Nâng cao</SelectItem>
        </SelectContent>
      </Select>

      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="h-10 min-w-[160px]">
          <SelectValue placeholder="Tất cả trạng thái">
            {status === "2" ? "Chờ duyệt" : status === "4" ? "Từ chối" : status === "5" ? "Đã xuất bản" : status === "6" ? "Lưu trữ" : "Tất cả trạng thái"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả trạng thái</SelectItem>
          <SelectItem value="2">Chờ duyệt</SelectItem>
          <SelectItem value="4">Từ chối</SelectItem>
          <SelectItem value="5">Đã xuất bản</SelectItem>
          <SelectItem value="6">Lưu trữ</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
