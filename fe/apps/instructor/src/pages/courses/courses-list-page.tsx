import { useState } from "react";
import { useNavigate } from "react-router";
import { Plus, Edit, Copy, BookOpen } from "lucide-react";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";

import {
  useGetCourses,
  useCloneCourse,
} from "@/features/courses/hook/use-courses";
import { DataTable } from "@/components/common/data-table/data-table";
import type { DataTableFeatures } from "@/components/common/data-table/data-table-features";
import { LEVEL_LABELS, STATUS_CONFIG } from "@/features/courses/components/course-list/course-card";

const STATUS_LABELS: Record<number, string> = {
  1: "Bản nháp",
  2: "Chờ duyệt",
  3: "Đã duyệt",
  4: "Bị từ chối",
  5: "Đã xuất bản",
  6: "Lưu trữ",
};

import { Button } from "@fe/components/ui/button";
import { Badge } from "@fe/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@fe/components/ui/select";

interface CourseRow {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  level: number;
  price: number;
  status: number;
}

export default function CoursesListPage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [level, setLevel] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [cloningId, setCloningId] = useState<string | null>(null);

  const { data: coursesData, isLoading, isFetching, refetch } = useGetCourses({
    page,
    limit: pageSize,
    keyword: keyword || undefined,
    level: level ? Number(level) : undefined,
    status: status ? Number(status) : undefined,
  });

  const { mutate: cloneCourse, isPending: isCloning } = useCloneCourse();

  const courses = (coursesData?.data ?? []) as CourseRow[];
  const meta = coursesData?.meta;

  const handleClone = (id: string) => {
    setCloningId(id);
    const tid = toast.loading("Đang nhân bản khóa học...");
    cloneCourse(String(id), {
      onSuccess: (res) => {
        toast.success("Đã nhân bản khóa học!", { id: tid });
        navigate(`/courses/${res.data.id}`);
      },
      onError: () => toast.error("Có lỗi xảy ra khi nhân bản.", { id: tid }),
      onSettled: () => setCloningId(null),
    });
  };

  const columns: ColumnDef<DataTableFeatures, CourseRow>[] = [
    {
      accessorKey: "thumbnail",
      header: "Ảnh",
      cell: ({ row }) => {
        const thumb = row.original.thumbnail;
        return (
          <div className="w-16 h-10 rounded-md overflow-hidden bg-muted flex-shrink-0">
            {thumb ? (
              <img src={thumb} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "title",
      header: "Tên khóa học",
      cell: ({ row }) => (
        <span className="font-medium line-clamp-1 max-w-[280px]">{row.original.title}</span>
      ),
    },
    {
      accessorKey: "level",
      header: "Cấp độ",
      cell: ({ row }) => (
        <span className="text-sm">{LEVEL_LABELS[row.original.level] ?? "—"}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => {
        const cfg = STATUS_CONFIG[row.original.status];
        return cfg ? (
          <Badge variant="outline" className={`${cfg.className} border-0`}>
            {cfg.label}
          </Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    },
    {
      accessorKey: "price",
      header: "Giá",
      cell: ({ row }) => (
        <span className="font-semibold text-primary">
          {row.original.price > 0
            ? `${Number(row.original.price).toLocaleString("vi-VN")} đ`
            : "Miễn phí"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Thao tác",
      cell: ({ row }) => {
        const course = row.original;
        return (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/courses/${course.id}`)}
              className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
              title="Chỉnh sửa"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleClone(course.id)}
              disabled={isCloning && cloningId === course.id}
              className="h-8 w-8 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg"
              title="Nhân bản"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Khóa học của tôi</h1>
          <p className="text-sm text-muted-foreground mt-1">Quản lý và cập nhật các khóa học của bạn</p>
        </div>
        <Button
          onClick={() => navigate("/courses/create")}
          className="shrink-0 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white border-0 shadow-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Tạo khóa học mới
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <Select value={level} onValueChange={(v) => { setLevel(v ?? ""); setPage(1); }}>
          <SelectTrigger className="h-9 min-w-[160px]">
            {level ? LEVEL_LABELS[Number(level)] : "Tất cả cấp độ"}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Cơ bản</SelectItem>
            <SelectItem value="2">Trung bình</SelectItem>
            <SelectItem value="3">Nâng cao</SelectItem>
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={(v) => { setStatus(v ?? ""); setPage(1); }}>
          <SelectTrigger className="h-9 min-w-[160px]">
            {status ? STATUS_LABELS[Number(status)] : "Tất cả trạng thái"}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Bản nháp</SelectItem>
            <SelectItem value="2">Chờ duyệt</SelectItem>
            <SelectItem value="3">Đã duyệt</SelectItem>
            <SelectItem value="4">Bị từ chối</SelectItem>
            <SelectItem value="5">Đã xuất bản</SelectItem>
            <SelectItem value="6">Lưu trữ</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={courses}
        page={page}
        pageSize={pageSize}
        totalPages={meta?.totalPages ?? 1}
        onPageChange={setPage}
        loading={isLoading}
        refetch={refetch}
        isFetching={isFetching}
        search={keyword}
        onSearchChange={(v) => { setKeyword(v); setPage(1); }}
        onPageSizeChange={(v) => { setPageSize(v); setPage(1); }}
        onRowClick={(row) => navigate(`/courses/${row.id}`)}
        text={{
          searchPlaceholder: "Tìm kiếm theo tên khóa học...",
          noResults: "Chưa có khóa học nào.",
          pageOf: (p, tp) => `Trang ${p} / ${tp || 1}`,
          previous: "Trước",
          next: "Sau",
        }}
      />
    </div>
  );
}
