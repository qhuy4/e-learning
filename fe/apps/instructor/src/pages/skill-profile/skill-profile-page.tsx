import { useMemo, useState } from "react";
import {
  ArrowRight,
  Award,
  MessageSquareText,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@fe/components/ui/badge";
import { Button } from "@fe/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@fe/components/ui/card";
import { Skeleton } from "@fe/components/ui/skeleton";
import { useSkillProfile } from "@/features/skill-profile/hooks/use-skill-profile";
import { SkillDetailDialog } from "@/features/skill-profile/components/skill-detail-dialog";
import {
  SKILL_STATE_META,
  scorePercent,
  skillDescription,
  skillDisplayName,
  skillState,
} from "@/features/skill-profile/config/skill.config";
import type {
  SkillCategory,
  SkillSummary,
} from "@/features/skill-profile/types/skill.types";

type MvpCategory = Exclude<SkillCategory, "SUBJECT">;

const CATEGORY_META: Record<
  MvpCategory,
  { label: string; description: string; note: string }
> = {
  LANGUAGE: {
    label: "Năng lực ngôn ngữ",
    description: "Được tính từ chứng chỉ đã được quản trị viên duyệt.",
    note: "“Đã xác nhận” là điểm lấy trực tiếp từ chứng chỉ. “Điểm ước tính” là kỹ năng được suy ra từ một điểm liên quan trên chứng chỉ.",
  },
  EXAM: {
    label: "Năng lực kỳ thi",
    description: "Được tính từ chứng chỉ kỳ thi đã được quản trị viên duyệt.",
    note: "“Đã xác nhận” là điểm được ghi trực tiếp trên chứng chỉ đã duyệt.",
  },
  PEDAGOGY: {
    label: "Năng lực giảng dạy",
    description:
      "Được tính từ đánh giá hợp lệ của học viên đã tham gia khóa học.",
    note: "“Đã đánh giá” là kết quả đã có đủ dữ liệu độc lập. “Điểm tạm thời” cần thêm đánh giá từ học viên.",
  },
};

function SkillRow({
  skill,
  onDetail,
}: {
  skill: SkillSummary;
  onDetail: () => void;
}) {
  const state = skillState(
    skill.score,
    skill.confidence,
    skill.assessmentStatus,
  );
  const percent = scorePercent(skill.score);
  const directCertificateResult =
    percent != null &&
    (skill.category === "LANGUAGE" || skill.category === "EXAM") &&
    skill.verifiedRatio >= 0.999;
  const displayMeta = directCertificateResult
    ? {
        label: "Đã xác nhận",
        badgeClass: SKILL_STATE_META.assessed.badgeClass,
      }
    : state === "provisional" &&
        (skill.category === "LANGUAGE" || skill.category === "EXAM")
      ? {
          label: "Điểm ước tính",
          badgeClass: SKILL_STATE_META.provisional.badgeClass,
        }
      : SKILL_STATE_META[state];
  return (
    <div className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold">{skillDisplayName(skill)}</span>
          <Badge variant="outline" className={displayMeta.badgeClass}>
            {displayMeta.label}
          </Badge>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {skillDescription(skill)}
        </p>
      </div>
      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <div className="text-right">
          <div className="font-bold tabular-nums">
            {percent == null ? "—" : `${percent}%`}
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onDetail}>
          Chi tiết <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function SkillProfilePage() {
  const [detailId, setDetailId] = useState<number | null>(null);
  const { data: skills = [], isLoading, isError, refetch } = useSkillProfile();
  const mvpSkills = useMemo(
    () => skills.filter((skill) => skill.category !== "SUBJECT"),
    [skills],
  );
  const groups = useMemo(
    () =>
      (["LANGUAGE", "EXAM", "PEDAGOGY"] as MvpCategory[])
        .map((category) => ({
          category,
          skills: mvpSkills.filter((skill) => skill.category === category),
        }))
        .filter((group) => group.skills.length > 0),
    [mvpSkills],
  );
  const assessedCount = mvpSkills.filter(
    (skill) => skill.assessmentStatus === "ASSESSED",
  ).length;
  const provisionalCount = mvpSkills.filter(
    (skill) => skill.assessmentStatus === "PROVISIONAL",
  ).length;
  const insufficientCount = mvpSkills.filter(
    (skill) =>
      skill.assessmentStatus === "NO_EVIDENCE" ||
      skill.assessmentStatus === "INSUFFICIENT_EVIDENCE",
  ).length;
  const evidenceCount = mvpSkills.reduce(
    (sum, skill) => sum + skill.evidenceCount,
    0,
  );

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Hồ sơ kỹ năng</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Kết quả được cập nhật tự động từ chứng chỉ đã được quản trị viên duyệt
          và đánh giá hợp lệ của học viên.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-5">
            <div className="text-2xl font-bold">{assessedCount}</div>
            <p className="text-xs text-muted-foreground">Kết quả đã hoàn tất</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="text-2xl font-bold">{provisionalCount}</div>
            <p className="text-xs text-muted-foreground">Kết quả tạm thời</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="text-2xl font-bold">{insufficientCount}</div>
            <p className="text-xs text-muted-foreground">Chưa đủ dữ liệu</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="text-2xl font-bold">{evidenceCount}</div>
            <p className="text-xs text-muted-foreground">
              Nguồn dữ liệu đã dùng
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-4 w-4" />
            Nguồn dữ liệu MVP
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="flex gap-3 rounded-lg border p-3">
            <Award className="mt-0.5 h-4 w-4 text-primary" />
            <div>
              <p className="text-sm font-medium">
                Chứng chỉ được quản trị viên duyệt
              </p>
              <p className="text-xs text-muted-foreground">
                Dùng cho năng lực ngôn ngữ và kỳ thi.
              </p>
            </div>
          </div>
          <div className="flex gap-3 rounded-lg border p-3">
            <MessageSquareText className="mt-0.5 h-4 w-4 text-primary" />
            <div>
              <p className="text-sm font-medium">Đánh giá học viên hợp lệ</p>
              <p className="text-xs text-muted-foreground">
                Dùng cho năng lực giảng dạy; mỗi học viên chỉ tính như một nguồn
                độc lập.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-36 w-full" />
          ))}
        </div>
      ) : isError ? (
        <Card>
          <CardContent className="flex items-center justify-between gap-3 pt-6">
            <p className="text-sm text-muted-foreground">
              Không tải được hồ sơ kỹ năng.
            </p>
            <Button variant="outline" onClick={() => refetch()}>
              Thử lại
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {groups.map(({ category, skills: categorySkills }) => (
            <Card key={category}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  {CATEGORY_META[category].label}
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {CATEGORY_META[category].description}
                </p>
                <p className="mt-2 rounded-md bg-muted px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                  <span className="font-medium text-foreground">Ghi chú: </span>
                  {CATEGORY_META[category].note}
                </p>
              </CardHeader>
              <CardContent className="space-y-2">
                {categorySkills.map((skill) => (
                  <SkillRow
                    key={skill.id}
                    skill={skill}
                    onDetail={() => setDetailId(skill.id)}
                  />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <SkillDetailDialog skillId={detailId} onClose={() => setDetailId(null)} />
    </div>
  );
}
