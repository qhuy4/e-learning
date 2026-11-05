import { useState } from "react";
import { Link } from "react-router";
import { CheckCircle2, Circle, GraduationCap, Save } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@fe/lib/utils";
import { Button } from "@fe/components/ui/button";
import { Badge } from "@fe/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@fe/components/ui/card";
import { Input } from "@fe/components/ui/input";
import { Label } from "@fe/components/ui/label";
import { Skeleton } from "@fe/components/ui/skeleton";
import { getErrorMessage } from "@/shared/utils/error";
import {
  useTeachingProfile,
  useUpdateTeachingProfile,
} from "@/features/teaching-profile/hooks/use-teaching-profile";
import { CEFR_LEVEL_OPTIONS } from "@/features/teaching-profile/types/teaching-profile.types";

/** Checklist chưa xong → link tới trang sửa / trang quản lý phù hợp */
const CHECKLIST_LINKS: Record<string, string> = {
  headline: "/profile",
  bio: "/profile",
  course: "/courses",
  certificate: "/certificates",
};

export default function TeachingProfilePage() {
  const { data: profile, isLoading } = useTeachingProfile();
  const updateMut = useUpdateTeachingProfile();

  const [experienceYears, setExperienceYears] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [teachingLevels, setTeachingLevels] = useState<string[]>([]);

  // Nạp profile vào form 1 lần khi data về (render-phase, không clobber khi user đang sửa)
  const [hydrated, setHydrated] = useState(false);
  if (profile && !hydrated) {
    setHydrated(true);
    setExperienceYears(
      profile.experienceYears != null ? String(profile.experienceYears) : "",
    );
    setWebsiteUrl(profile.websiteUrl ?? "");
    setTeachingLevels(profile.teachingLevels ?? []);
  }

  const toggleLevel = (band: string) => {
    setTeachingLevels((prev) =>
      prev.includes(band) ? prev.filter((b) => b !== band) : [...prev, band],
    );
  };

  const handleSave = () => {
    updateMut.mutate(
      {
        experienceYears:
          experienceYears === "" ? null : Number(experienceYears),
        websiteUrl: websiteUrl.trim() || null,
        teachingLevels,
      },
      {
        onSuccess: () => toast.success("Đã lưu hồ sơ giảng dạy!"),
        onError: (err) => toast.error(getErrorMessage(err)),
      },
    );
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-9 w-72" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full lg:col-span-2" />
        </div>
      </div>
    );
  }

  const completion = profile?.completion;
  const stats = profile?.stats;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hồ sơ giảng dạy</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tự khai báo kinh nghiệm — hiển thị trên hồ sơ, không thay thế bằng
          chứng đã xác minh (chứng chỉ, đánh giá học viên).
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: completion + stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Độ hoàn thiện</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-end justify-between">
                  <span className="text-3xl font-bold tabular-nums">
                    {completion?.percent ?? 0}%
                  </span>
                  <span className="text-xs text-muted-foreground">
                    hồ sơ giảng dạy
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-emerald-600 transition-all"
                    style={{ width: `${completion?.percent ?? 0}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                {completion?.items.map((item) => {
                  const link = CHECKLIST_LINKS[item.key];
                  return (
                    <div key={item.key} className="flex items-center gap-2">
                      {item.done ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                      <span
                        className={cn(
                          "flex-1 text-sm",
                          !item.done && "text-muted-foreground",
                        )}
                      >
                        {item.label}
                      </span>
                      {!item.done && link && (
                        <Link
                          to={link}
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          Thêm
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Thống kê</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-lg border p-2.5">
                  <div className="text-lg font-bold tabular-nums">
                    {stats?.courseCount ?? 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Khóa học</div>
                </div>
                <div className="rounded-lg border p-2.5">
                  <div className="text-lg font-bold tabular-nums">
                    {stats?.lessonCount ?? 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Bài học</div>
                </div>
                <div className="rounded-lg border p-2.5">
                  <div className="text-lg font-bold tabular-nums">
                    {stats?.certificateCount ?? 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Chứng chỉ</div>
                </div>
                <div className="rounded-lg border p-2.5">
                  <div className="text-lg font-bold tabular-nums">
                    {stats?.avgRating != null
                      ? Number(stats.avgRating).toFixed(1)
                      : "—"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Đánh giá TB
                  </div>
                </div>
              </div>

              {profile && profile.subjects.length > 0 && (
                <div>
                  <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <GraduationCap className="h-3.5 w-3.5" />
                    Môn học (từ khóa học)
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.subjects.map((subject) => (
                      <Badge key={subject} variant="secondary">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: self-report form */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Tự khai báo</CardTitle>
            <p className="text-xs text-muted-foreground">
              Các mục tuỳ chọn. Thông tin tự khai chỉ hiển thị trên hồ sơ, không
              tham gia tính điểm kỹ năng.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Experience */}
            <div className="space-y-2">
              <Label htmlFor="experienceYears">
                Kinh nghiệm giảng dạy (số năm)
              </Label>
              <Input
                id="experienceYears"
                type="number"
                min={0}
                max={60}
                className="max-w-40"
                placeholder="Ví dụ: 5"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
              />
            </div>

            {/* Levels — dữ liệu cho filter level khi học viên tìm giảng viên */}
            <div className="space-y-2">
              <Label>Các level bạn giảng dạy</Label>
              <div className="flex flex-wrap gap-1.5">
                {CEFR_LEVEL_OPTIONS.map((band) => {
                  const active = teachingLevels.includes(band);
                  return (
                    <button
                      key={band}
                      type="button"
                      onClick={() => toggleLevel(band)}
                      aria-pressed={active}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
                        active
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-input text-muted-foreground hover:border-primary/50",
                      )}
                    >
                      {band}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Dùng để xếp hạng khi học viên tìm giảng viên theo level của họ.
                Chưa khai báo = luôn hiển thị.
              </p>
            </div>

            {/* Methods / Video — cột DB giữ nguyên, chưa ghi/đọc qua API. */}
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="websiteUrl">Website / portfolio</Label>
                <Input
                  id="websiteUrl"
                  type="url"
                  placeholder="https://..."
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end border-t pt-4">
              <Button
                onClick={handleSave}
                disabled={updateMut.isPending}
              >
                <Save className="mr-1.5 h-4 w-4" />
                {updateMut.isPending ? "Đang lưu..." : "Lưu hồ sơ"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
