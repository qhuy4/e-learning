import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Eye, CheckCircle, XCircle } from "lucide-react";
import { useGetCourses } from "@/features/courses/hooks/use-admin-courses";
import {
  useApproveCourse,
  useRejectCourse,
} from "@/features/courses/hooks/use-admin-courses";
import { adminCourseService } from "@/features/courses/services/admin-course.service";

import { AdminCourseFilterBar } from "@/features/courses/components/admin-course-list/admin-course-filter-bar";
import { AdminCourseListSkeleton } from "@/features/courses/components/admin-course-list/admin-course-skeleton";
import { AdminCourseEmptyState } from "@/features/courses/components/admin-course-list/admin-course-empty-state";
import { AdminCoursePagination } from "@/features/courses/components/admin-course-list/admin-course-pagination";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@fe/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@fe/components/ui/table";
import {
  LEVEL_LABELS,
  STATUS_CONFIG,
} from "@/features/courses/components/admin-course-list/admin-course-card";
import { Badge } from "@fe/components/ui/badge";

const LIMIT = 10;

export function AdminCoursesListPage() {
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");
  const [level, setLevel] = useState<string>("");
  const [status, setStatus] = useState<string>("2");
  const [page, setPage] = useState(1);

  const [actionCourse, setActionCourse] = useState<{
    id: string | number;
    action: "approve" | "reject";
  } | null>(null);

  const { data: coursesData, isLoading } = useGetCourses({
    page,
    limit: LIMIT,
    keyword: keyword || undefined,
    level: level && level !== "all" ? level : undefined,
    status: status && status !== "all" ? status : undefined,
  });

  const { mutate: approveCourse, isPending: isApproving } = useApproveCourse();
  const { mutate: rejectCourse, isPending: isRejecting } = useRejectCourse();

  const courses = coursesData?.data ?? [];
  const meta = coursesData?.meta;

  const handleFilterChange = () => setPage(1);

  const handlePreview = async (id: string | number) => {
    try {
      const res = await adminCourseService.getPreviewToken(id);
      if (res?.token) {
        window.open(
          `http://localhost:5173/courses/preview/${res.token}`,
          "_blank",
        );
      }
    } catch (error) {
      console.error("Lỗi lấy preview token:", error);
      toast.error("Không thể tạo preview token");
    }
  };

  const handleApproveRequest = (id: string | number) => {
    setActionCourse({ id, action: "approve" });
  };

  const handleRejectRequest = (id: string | number) => {
    setActionCourse({ id, action: "reject" });
  };

  const handleConfirmAction = () => {
    if (!actionCourse) return;
    const { id, action } = actionCourse;
    const isApprove = action === "approve";

    const tid = toast.loading(
      isApprove ? "Đang duyệt khóa học..." : "Đang từ chối khóa học...",
    );

    if (isApprove) {
      approveCourse(id, {
        onSuccess: () => {
          toast.success("Đã duyệt và xuất bản khóa học thành công!", {
            id: tid,
          });
        },
        onError: () =>
          toast.error("Có lỗi xảy ra, vui lòng thử lại.", { id: tid }),
        onSettled: () => setActionCourse(null),
      });
    } else {
      rejectCourse(
        { id, reason: "Từ chối khóa học" },
        {
          onSuccess: () => {
            toast.success("Đã từ chối khóa học!", { id: tid });
          },
          onError: () =>
            toast.error("Có lỗi xảy ra, vui lòng thử lại.", { id: tid }),
          onSettled: () => setActionCourse(null),
        },
      );
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Duyệt khóa học</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Xem xét và phê duyệt các khóa học do giáo viên đăng tải
          </p>
        </div>
      </div>

      <AdminCourseFilterBar
        keyword={keyword}
        level={level}
        status={status}
        onKeywordChange={(v) => {
          setKeyword(v);
          handleFilterChange();
        }}
        onLevelChange={(v) => {
          setLevel(v);
          handleFilterChange();
        }}
        onStatusChange={(v) => {
          setStatus(v);
          handleFilterChange();
        }}
      />

      {isLoading ? (
        <AdminCourseListSkeleton />
      ) : courses.length === 0 ? (
        <AdminCourseEmptyState />
      ) : (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[300px]">Khóa học</TableHead>
                <TableHead>Cấp độ</TableHead>
                <TableHead>Giá</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Phiên bản</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course: any) => {
                const statusInfo = STATUS_CONFIG[course.status];
                const isProcessing =
                  (isApproving || isRejecting) &&
                  actionCourse?.id === course.id;

                return (
                  <TableRow key={course.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {course.thumbnail ? (
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-12 h-12 rounded object-cover shrink-0 bg-muted"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded bg-muted flex items-center justify-center shrink-0">
                            <span className="text-xs text-muted-foreground">
                              No img
                            </span>
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span
                            className="font-semibold text-sm line-clamp-1"
                            title={course.title}
                          >
                            {course.title}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {LEVEL_LABELS[course.level] ?? course.level}
                    </TableCell>
                    <TableCell>
                      {course.price > 0
                        ? `${Number(course.price).toLocaleString("vi-VN")} đ`
                        : "Miễn phí"}
                    </TableCell>
                    <TableCell>
                      {statusInfo && (
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full ${statusInfo.className}`}
                        >
                          {statusInfo.label}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {course.parentId ? (
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full dark:bg-blue-900/30 dark:text-blue-400">
                          Bản cập nhật
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full dark:bg-emerald-900/30 dark:text-emerald-400">
                          Mới tạo
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="rounded-full border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-600"
                      >
                        v{course.version}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handlePreview(course.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
                          title="Xem trước"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {course.status === 2 && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleApproveRequest(course.id)}
                              disabled={isProcessing}
                              className="h-8 w-8 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-100 rounded-lg"
                              title="Duyệt"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRejectRequest(course.id)}
                              disabled={isProcessing}
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                              title="Từ chối"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {!isLoading && meta && meta.totalPages > 1 && (
        <AdminCoursePagination
          page={page}
          totalPages={meta.totalPages}
          total={meta.total}
          onPageChange={setPage}
        />
      )}

      <ConfirmDialog
        open={actionCourse !== null}
        title={
          actionCourse?.action === "approve"
            ? "Duyệt khóa học"
            : "Từ chối khóa học"
        }
        description={
          actionCourse?.action === "approve"
            ? "Bạn có chắc chắn muốn duyệt khóa học này? Khóa học sẽ được xuất bản công khai trực tiếp trên hệ thống (nếu là bản gốc) hoặc thay thế bản gốc (nếu là bản cập nhật)."
            : "Bạn có chắc chắn muốn từ chối khóa học này? Giáo viên sẽ cần chỉnh sửa lại để được duyệt."
        }
        confirmLabel={actionCourse?.action === "approve" ? "Duyệt" : "Từ chối"}
        onConfirm={handleConfirmAction}
        onCancel={() => setActionCourse(null)}
      />
    </div>
  );
}
