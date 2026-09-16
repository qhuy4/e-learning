import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useListPage } from "@/components/common/page/use-list-page";
import { DataTable } from "@/components/common/data-table/data-table";
import { createColumnHelper } from "@tanstack/react-table";
import {
  useAchievement,
  useAchievementUsers,
  useUpdateAchievement,
  useDeleteAchievement,
} from "@/features/achievements/hooks/use-achievements";
import { achievementCriteriaLabel } from "@/features/achievements/types/achievement";
import type { AchievementCriteria } from "@/features/achievements/types/achievement";
import type { AchievementUser } from "@/features/achievements/types/achievement";
import type { DataTableFeatures } from "@/components/common/data-table/data-table-features";
import { Button } from "@fe/components/ui/button";
import { Badge } from "@fe/components/ui/badge";
import { Input } from "@fe/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@fe/components/ui/select";
import { ArrowLeft, Trash2, Pencil, Save, X } from "lucide-react";
import { toast } from "sonner";

const userColumn = createColumnHelper<DataTableFeatures, AchievementUser>();

const userColumns = [
  userColumn.accessor("userName", {
    header: "Học viên",
    cell: (info) => <span className="font-medium">{info.getValue()}</span>,
  }),
  userColumn.accessor("userEmail", {
    header: "Email",
    cell: (info) => <span>{info.getValue()}</span>,
  }),
  userColumn.accessor("earnedAt", {
    header: "Ngày đạt",
    cell: (info) => {
      const v = info.getValue();
      if (!v) return "—";
      return new Date(v).toLocaleDateString("vi-VN");
    },
  }),
];

const criteriaOptions = [
  { value: "LESSONS_COMPLETED", label: "Bài học hoàn thành" },
  { value: "COURSES_COMPLETED", label: "Khóa học hoàn thành" },
  { value: "QUIZZES_COMPLETED", label: "Quiz hoàn thành" },
  { value: "LEARNING_HOURS", label: "Giờ học" },
  { value: "PERFECT_QUIZ_SCORE", label: "Quiz 100%" },
  { value: "HIGH_QUIZ_SCORES", label: "Quiz 90%+" },
  { value: "STREAK_DAYS", label: "Chuỗi ngày học" },
  { value: "SPEAKING_SESSIONS", label: "Speaking" },
  { value: "GRAMMAR_EXERCISES", label: "Grammar" },
  { value: "VOCABULARY_WORDS", label: "Từ vựng" },
  { value: "ACHIEVEMENTS_EARNED", label: "Thành tựu" },
];

export default function AchievementDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: achievement, isLoading } = useAchievement(Number(id));
  const updateMutation = useUpdateAchievement();
  const deleteMutation = useDeleteAchievement();

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    icon: "",
    category: "",
    criteria: "",
    threshold: 1,
    isActive: true,
  });

  const { page, limit, search, debouncedSearch, setPage, setLimit, setSearch } = useListPage();
  const { data: usersData, isLoading: usersLoading, refetch, isFetching } = useAchievementUsers(
    Number(id),
    page,
    limit,
    debouncedSearch || undefined,
  );

  const users = usersData?.data ?? [];
  const usersMeta = usersData?.meta;
  const usersTotalPages = usersMeta ? Math.ceil(usersMeta.total / usersMeta.limit) : 0;

  const startEdit = () => {
    if (!achievement) return;
    setEditForm({
      name: achievement.name,
      description: achievement.description,
      icon: achievement.icon ?? "",
      category: achievement.category ?? "",
      criteria: achievement.criteria,
      threshold: achievement.threshold,
      isActive: achievement.isActive,
    });
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
  };

  const saveEdit = () => {
    updateMutation.mutate(
      { id: Number(id), data: editForm },
      {
        onSuccess: () => {
          toast.success("Đã cập nhật thành tựu");
          setIsEditing(false);
        },
        onError: () => toast.error("Không thể cập nhật thành tựu"),
      },
    );
  };

  const handleDelete = () => {
    if (!confirm("Bạn có chắc chắn muốn xóa thành tựu này?")) return;
    deleteMutation.mutate(Number(id), {
      onSuccess: () => {
        toast.success("Đã xóa thành tựu");
        navigate("/achievements");
      },
      onError: () => toast.error("Không thể xóa thành tựu"),
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="h-64 bg-muted rounded" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!achievement) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Không tìm thấy thành tựu.</p>
      </div>
    );
  }

  const isActive = achievement.isActive;
  const criteria = achievement.criteria as AchievementCriteria;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2"
            onClick={() => navigate("/achievements")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Quay lại
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={cancelEdit} disabled={updateMutation.isPending}>
                <X className="h-4 w-4 mr-1" /> Hủy
              </Button>
              <Button size="sm" onClick={saveEdit} disabled={updateMutation.isPending}>
                <Save className="h-4 w-4 mr-1" /> Lưu
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={startEdit}>
                <Pencil className="h-4 w-4 mr-1" /> Chỉnh sửa
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleteMutation.isPending}>
                <Trash2 className="h-4 w-4 mr-1" /> Xóa
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {isEditing ? (
          <Input
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            className="text-2xl font-bold w-auto"
          />
        ) : (
          <h1 className="text-2xl font-bold">{achievement.name}</h1>
        )}
        <Badge className={isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
          {isActive ? "Đang kích hoạt" : "Tạm dừng"}
        </Badge>
      </div>

      <div className="rounded-xl border bg-card">
        <div className="px-6 py-4 border-b">
          <h2 className="font-semibold">Thông tin thành tựu</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 p-6">
          <div>
            <p className="text-sm text-muted-foreground">Tên</p>
            {isEditing ? (
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="mt-1"
              />
            ) : (
              <p className="font-medium">{achievement.name}</p>
            )}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Mô tả</p>
            {isEditing ? (
              <Input
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="mt-1"
              />
            ) : (
              <p className="font-medium">{achievement.description}</p>
            )}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Icon</p>
            {isEditing ? (
              <Input
                value={editForm.icon}
                onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
                className="mt-1"
                placeholder="Emoji hoặc URL"
              />
            ) : (
              <p className="font-medium">{achievement.icon || "—"}</p>
            )}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Danh mục</p>
            {isEditing ? (
              <Input
                value={editForm.category}
                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                className="mt-1"
                placeholder="Progress, Quiz / Knowledge, ..."
              />
            ) : (
              <p className="font-medium">{achievement.category || "—"}</p>
            )}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Loại tiêu chí</p>
            {isEditing ? (
              <Select
                value={editForm.criteria}
                onValueChange={(v) => setEditForm({ ...editForm, criteria: v })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue>
                    {criteriaOptions.find((o) => o.value === editForm.criteria)?.label ?? "Chọn tiêu chí"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {criteriaOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="font-medium">{achievementCriteriaLabel[criteria] ?? criteria}</p>
            )}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Ngưỡng đạt</p>
            {isEditing ? (
              <Input
                type="number"
                value={editForm.threshold}
                onChange={(e) => setEditForm({ ...editForm, threshold: Number(e.target.value) })}
                className="mt-1"
                min={1}
              />
            ) : (
              <p className="font-medium">{achievement.threshold}</p>
            )}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Trạng thái</p>
            {isEditing ? (
              <Select
                value={editForm.isActive ? "true" : "false"}
                onValueChange={(v) => setEditForm({ ...editForm, isActive: v === "true" })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue>
                    {editForm.isActive ? "Kích hoạt" : "Tạm dừng"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Kích hoạt</SelectItem>
                  <SelectItem value="false">Tạm dừng</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="font-medium">{isActive ? "Kích hoạt" : "Tạm dừng"}</p>
            )}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Ngày tạo</p>
            <p className="font-medium">
              {new Date(achievement.createdAt).toLocaleDateString("vi-VN")}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Ngày cập nhật</p>
            <p className="font-medium">
              {new Date(achievement.updatedAt).toLocaleDateString("vi-VN")}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card">
        <div className="px-6 py-4 border-b">
          <h2 className="font-semibold">Học viên đã đạt được</h2>
        </div>
        <div className="p-6">
          <DataTable
            columns={userColumns}
            data={users}
            page={page}
            totalPages={usersTotalPages}
            loading={usersLoading}
            isFetching={isFetching}
            refetch={refetch}
            pageSize={limit}
            onPageChange={setPage}
            search={search}
            onSearchChange={setSearch}
            onPageSizeChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
            text={{
              searchPlaceholder: "Tìm học viên...",
              reload: "Tải lại",
              rowsPerPage: "Dòng trên trang",
              noResults: "Chưa có học viên nào đạt được thành tựu này.",
              pageOf: (p, tp) => `Trang ${p} / ${tp || 1}`,
              previous: "Trước",
              next: "Sau",
            }}
          />
        </div>
      </div>
    </div>
  );
}
