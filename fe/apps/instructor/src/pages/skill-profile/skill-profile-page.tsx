import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  FileSearch,
  Gauge,
  Lightbulb,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@fe/components/ui/badge";
import { Button } from "@fe/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@fe/components/ui/card";
import { Skeleton } from "@fe/components/ui/skeleton";
import { getErrorMessage } from "@/shared/utils/error";
import {
  useRefreshSkillProfile,
  useSkillEvidence,
  useSkillProfile,
  useSkillRecommendations,
} from "@/features/skill-profile/hooks/use-skill-profile";
import { ConfidenceBadge } from "@/features/skill-profile/components/confidence-badge";
import { SkillDetailDialog } from "@/features/skill-profile/components/skill-detail-dialog";
import { SkillRadarChart } from "@/features/skill-profile/components/skill-radar-chart";
import {
  SKILL_STATE_META,
  scorePercent,
  skillDescription,
  skillDisplayName,
  skillState,
} from "@/features/skill-profile/config/skill.config";
import type {
  LimitedSkill,
  SkillCategory,
  SkillSummary,
} from "@/features/skill-profile/types/skill.types";

const CATEGORY_LABELS: Record<SkillCategory, string> = {
  SUBJECT: "Chuyên môn",
  PEDAGOGY: "Sư phạm",
};

interface OverviewStatProps {
  icon: ReactNode;
  label: string;
  value: string;
  hint: string;
}

function OverviewStat({ icon, label, value, hint }: OverviewStatProps) {
  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold tabular-nums">{value}</div>
      <div className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
        {hint}
      </div>
    </div>
  );
}

function ExplainItem({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-center gap-1.5 text-sm font-semibold">
        {icon}
        {title}
      </div>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        {text}
      </p>
    </div>
  );
}

function GroupCard({
  icon,
  title,
  description,
  count,
  children,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  count?: number;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          {icon}
          {title}
          {count != null && (
            <Badge variant="secondary" className="text-[10px]">
              {count}
            </Badge>
          )}
        </CardTitle>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="space-y-2">{children}</CardContent>
    </Card>
  );
}

function CategoryBadge({ category }: { category: SkillCategory }) {
  return (
    <Badge variant="outline" className="text-[10px]">
      {CATEGORY_LABELS[category]}
    </Badge>
  );
}

function AssessedSkillRow({
  skill,
  score,
  confidence,
  evidenceCount,
  onDetail,
}: {
  skill: { id: number; code: string; name: string; category: SkillCategory };
  score: number | null;
  confidence: number | null;
  evidenceCount: number;
  onDetail: () => void;
}) {
  const pct = scorePercent(score);
  return (
    <div className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-sm font-semibold">
            {skillDisplayName(skill)}
          </span>
          <CategoryBadge category={skill.category} />
          {skillState(score, confidence) === "insufficient" && (
            <Badge
              variant="outline"
              className={SKILL_STATE_META.insufficient.badgeClass}
            >
              {SKILL_STATE_META.insufficient.label}
            </Badge>
          )}
        </div>
        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
          {skillDescription(skill)}
        </p>
      </div>
      <div className="flex items-center gap-3 sm:shrink-0">
        <div className="text-right">
          <div className="text-sm font-bold tabular-nums">
            {pct != null ? `${pct}%` : "—"}
          </div>
          <ConfidenceBadge value={confidence} />
        </div>
        <Badge
          variant="outline"
          className="hidden text-[10px] sm:inline-flex"
          title={`${evidenceCount} bằng chứng AI đã dùng`}
        >
          {evidenceCount} bằng chứng
        </Badge>
        <Button variant="ghost" size="xs" onClick={onDetail}>
          Chi tiết
          <ArrowRight className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

function NeedsEvidenceRow({
  item,
  onDetail,
  onAddEvidence,
}: {
  item: LimitedSkill;
  onDetail: () => void;
  onAddEvidence: () => void;
}) {
  const pct = scorePercent(item.score);
  return (
    <div className="rounded-lg border border-amber-300/60 bg-amber-50/40 p-3 dark:border-amber-800/60 dark:bg-amber-950/20">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-sm font-semibold">
          {skillDisplayName(item.skill)}
        </span>
        <CategoryBadge category={item.skill.category} />
        <Badge
          variant="outline"
          className={SKILL_STATE_META.insufficient.badgeClass}
        >
          {SKILL_STATE_META.insufficient.label}
        </Badge>
        {pct != null && (
          <span className="ml-auto text-sm font-bold tabular-nums">
            {pct}%
          </span>
        )}
      </div>
      <p className="mt-0.5 text-xs text-muted-foreground">
        {skillDescription(item.skill)}
      </p>
      <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
        {item.reason}
        {item.score != null && item.confidence != null
          ? ` · AI mới chắc chắn ${Math.round(item.confidence * 100)}%`
          : ""}
      </p>

      {item.actions.length > 0 && (
        <div className="mt-1.5 space-y-0.5">
          <p className="text-xs font-medium">Cách bổ sung bằng chứng:</p>
          {item.actions.map((action) => (
            <p
              key={action.type}
              className="flex items-start gap-1.5 text-xs text-muted-foreground"
            >
              <span className="text-primary">→</span>
              {action.label}
            </p>
          ))}
        </div>
      )}

      <div className="mt-2 flex flex-wrap gap-1.5">
        <Button variant="outline" size="xs" onClick={onAddEvidence}>
          <FileSearch className="h-3 w-3" />
          Thêm bằng chứng
        </Button>
        <Button variant="ghost" size="xs" onClick={onDetail}>
          Chi tiết
          <ArrowRight className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

function UnassessedSkillRow({
  skill,
  onDetail,
  onAddEvidence,
}: {
  skill: SkillSummary;
  onDetail: () => void;
  onAddEvidence: () => void;
}) {
  return (
    <div className="rounded-lg border border-dashed p-3">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-sm font-semibold">
          {skillDisplayName(skill)}
        </span>
        <CategoryBadge category={skill.category} />
        <Badge
          variant="outline"
          className={SKILL_STATE_META["no-data"].badgeClass}
        >
          {SKILL_STATE_META["no-data"].label}
        </Badge>
      </div>
      <p className="mt-0.5 text-xs text-muted-foreground">
        {skillDescription(skill)}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Chưa có bằng chứng nào — AI chưa thể đánh giá. Điều này không có nghĩa là
        bạn dạy kém kỹ năng này.
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <Button variant="outline" size="xs" onClick={onAddEvidence}>
          <FileSearch className="h-3 w-3" />
          Thêm bằng chứng
        </Button>
        <Button variant="ghost" size="xs" onClick={onDetail}>
          Chi tiết
          <ArrowRight className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-9 w-72" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
      <Skeleton className="h-40 w-full" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-80 w-full lg:col-span-2" />
      </div>
    </div>
  );
}

export default function SkillProfilePage() {
  const navigate = useNavigate();
  const {
    data: skills,
    isLoading,
    isError,
    refetch,
  } = useSkillProfile();
  const {
    data: recommendations,
    isLoading: recommendationsLoading,
    isError: recommendationsError,
  } = useSkillRecommendations();
  const {
    data: evidenceData,
    isLoading: evidenceLoading,
    isError: evidenceError,
  } = useSkillEvidence({ limit: 1 });
  const refreshMut = useRefreshSkillProfile();
  const [detailId, setDetailId] = useState<number | null>(null);

  const handleRefresh = () => {
    refreshMut.mutate(undefined, {
      onSuccess: (result) =>
        toast.success(
          `Đã cập nhật đánh giá — AI ghi nhận thêm ${result.extracted.created} bằng chứng mới và tính lại điểm.`,
        ),
      onError: (err) => toast.error(getErrorMessage(err)),
    });
  };

  if (isLoading) return <LoadingState />;

  if (isError) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Hồ sơ kỹ năng AI
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Đánh giá của AI dựa trên bằng chứng thực tế từ hoạt động giảng dạy
            của bạn.
          </p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            <p className="font-medium">Không tải được hồ sơ kỹ năng</p>
            <p className="max-w-md text-sm text-muted-foreground">
              Dữ liệu đánh giá của bạn vẫn được giữ nguyên. Vui lòng thử lại.
            </p>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="mr-1.5 h-4 w-4" />
              Thử lại
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const allSkills = skills ?? [];
  const scoredSkills = allSkills.filter((skill) => skill.score != null);
  const assessedSkills = scoredSkills.filter(
    (skill) => skillState(skill.score, skill.confidence) === "assessed",
  );
  const unassessedSkills = allSkills.filter((skill) => skill.score == null);

  // Nhóm "điểm mạnh" và "cần thêm bằng chứng" lấy từ API recommendations.
  const strengths = recommendationsError
    ? []
    : (recommendations?.strengths ?? []);
  const limited = recommendationsError ? [] : (recommendations?.limited ?? []);
  const insufficientItems: LimitedSkill[] = recommendationsError
    ? scoredSkills
        .filter(
          (skill) =>
            skillState(skill.score, skill.confidence) === "insufficient",
        )
        .map((skill) => ({
          skill: {
            id: skill.id,
            code: skill.code,
            name: skill.name,
            category: skill.category,
          },
          score: skill.score,
          confidence: skill.confidence,
          evidenceCount: skill.evidenceCount,
          reason: "Bằng chứng còn ít nên AI chưa thể kết luận chắc chắn.",
          actions: [],
        }))
    : limited.filter((item) => item.score != null);

  const strengthIds = new Set(strengths.map((item) => item.skill.id));
  const insufficientIds = new Set(
    insufficientItems.map((item) => item.skill.id),
  );
  const otherAssessed = assessedSkills.filter(
    (skill) => !strengthIds.has(skill.id) && !insufficientIds.has(skill.id),
  );

  const evidenceTotal = Object.values(evidenceData?.counts ?? {}).reduce(
    (total, count) => total + (count ?? 0),
    0,
  );
  const needsEvidenceCount = recommendationsError
    ? insufficientItems.length + unassessedSkills.length
    : limited.length;
  const hasNoEvidence = scoredSkills.length === 0;
  const showRadar = assessedSkills.length >= 3;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Hồ sơ kỹ năng AI
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            AI đánh giá kỹ năng giảng dạy của bạn từ bằng chứng thực tế. Bạn
            không sửa điểm trực tiếp — chỉ cần bổ sung bằng chứng, AI sẽ tự tính
            lại.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshMut.isPending}
          >
            <RefreshCw
              className={`mr-1.5 h-4 w-4 ${refreshMut.isPending ? "animate-spin" : ""}`}
            />
            {refreshMut.isPending ? "Đang tính lại..." : "Cập nhật đánh giá"}
          </Button>
          <Button variant="outline" onClick={() => navigate("/evidence")}>
            Thêm bằng chứng
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <OverviewStat
          icon={<Target className="h-3.5 w-3.5" />}
          label="Kỹ năng đã đánh giá"
          value={`${assessedSkills.length}/${allSkills.length}`}
          hint="Số kỹ năng AI đã đủ dữ liệu để đánh giá."
        />
        <OverviewStat
          icon={<FileSearch className="h-3.5 w-3.5" />}
          label="Bằng chứng đang dùng"
          value={
            evidenceLoading ? "…" : evidenceError ? "—" : String(evidenceTotal)
          }
          hint="Đánh giá học viên, bài học, chứng chỉ, tiến độ và tự khai báo."
        />
        <OverviewStat
          icon={<CheckCircle2 className="h-3.5 w-3.5" />}
          label="Điểm mạnh đã xác nhận"
          value={
            recommendationsLoading
              ? "…"
              : recommendationsError
                ? "—"
                : String(strengths.length)
          }
          hint="Score cao và confidence đủ cao — AI khẳng định được."
        />
        <OverviewStat
          icon={<Lightbulb className="h-3.5 w-3.5" />}
          label="Cần bổ sung bằng chứng"
          value={
            recommendationsLoading ? "…" : String(needsEvidenceCount)
          }
          hint="Chưa đủ bằng chứng để AI kết luận chắc chắn."
        />
      </div>

      {/* Explainer */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            Cách AI đánh giá kỹ năng của bạn
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Mọi điểm đều dựa trên bằng chứng và được tính lại khi bạn bổ sung dữ
            liệu.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <ExplainItem
              icon={<Gauge className="h-4 w-4 text-muted-foreground" />}
              title="Score"
              text="Mức độ AI đánh giá kỹ năng, từ 0–100%. Điểm cao hơn nghĩa là AI thấy kỹ năng mạnh hơn."
            />
            <ExplainItem
              icon={<ShieldCheck className="h-4 w-4 text-muted-foreground" />}
              title="Confidence"
              text="AI chắc chắn đến đâu về đánh giá đó. Confidence thấp nghĩa là cần thêm bằng chứng từ nhiều nguồn."
            />
            <ExplainItem
              icon={<FileSearch className="h-4 w-4 text-muted-foreground" />}
              title="Evidence"
              text="Thông tin AI dùng để đánh giá: đánh giá học viên, bài học, chứng chỉ, tiến độ học viên và phần bạn tự khai báo."
            />
          </div>
        </CardContent>
      </Card>

      {recommendationsError && !isLoading && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-300/60 bg-amber-50/50 px-3 py-2 text-xs text-muted-foreground dark:border-amber-800/60 dark:bg-amber-950/30">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
          Không tải được gợi ý nhóm kỹ năng. Danh sách bên dưới vẫn hiển thị
          theo trạng thái đánh giá thực tế.
        </div>
      )}

      {/* Empty state */}
      {hasNoEvidence && allSkills.length > 0 && (
        <Card className="border-dashed">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              Chưa có dữ liệu để AI đánh giá
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Thiếu dữ liệu{" "}
              <span className="font-medium text-foreground">
                không có nghĩa là bạn dạy chưa tốt
              </span>
              . AI chỉ kết luận khi có bằng chứng — hãy bắt đầu từ một trong các
              bước sau.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Link
                to="/teaching-profile"
                className="flex items-start gap-2 rounded-lg border p-3 text-sm transition-colors hover:bg-muted/60"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>
                  <span className="font-medium">
                    Hoàn thiện Hồ sơ giảng dạy
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    Kinh nghiệm, cấp độ học viên và phương pháp giảng dạy.
                  </span>
                </span>
              </Link>
              <Link
                to="/evidence"
                className="flex items-start gap-2 rounded-lg border p-3 text-sm transition-colors hover:bg-muted/60"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>
                  <span className="font-medium">
                    Thêm tự đánh giá hoặc kinh nghiệm
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    Hai nguồn bằng chứng bạn có thể khai báo trực tiếp.
                  </span>
                </span>
              </Link>
              <Link
                to="/certificates"
                className="flex items-start gap-2 rounded-lg border p-3 text-sm transition-colors hover:bg-muted/60"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>
                  <span className="font-medium">Thêm chứng chỉ</span>
                  <span className="block text-xs text-muted-foreground">
                    Chứng chỉ liên quan giúp AI đánh giá chuyên môn.
                  </span>
                </span>
              </Link>
              <Link
                to="/courses"
                className="flex items-start gap-2 rounded-lg border p-3 text-sm transition-colors hover:bg-muted/60"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>
                  <span className="font-medium">
                    Tạo và xuất bản khóa học
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    Bài học được AI phân tích; đánh giá và tiến độ học viên được
                    thu thập tự động khi có dữ liệu.
                  </span>
                </span>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Radar — chỉ hiển thị khi đủ dữ liệu */}
        {showRadar && (
          <Card className="lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Radar kỹ năng
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {assessedSkills.length}/{allSkills.length} kỹ năng đã được AI
                đánh giá đủ chắc chắn để hiển thị trên radar.
              </p>
            </CardHeader>
            <CardContent>
              <SkillRadarChart skills={assessedSkills} />
            </CardContent>
          </Card>
        )}

        <div
          className={
            showRadar
              ? "space-y-6 lg:col-span-2"
              : "space-y-6 lg:col-span-3"
          }
        >
          {/* Confirmed strengths */}
          {(recommendationsLoading || strengths.length > 0) && (
            <GroupCard
              icon={
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              }
              title="Điểm mạnh đã xác nhận"
              description="AI đã đủ dữ liệu để khẳng định bạn làm tốt các kỹ năng này."
              count={recommendationsLoading ? undefined : strengths.length}
            >
              {recommendationsLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                strengths.map((item) => (
                  <AssessedSkillRow
                    key={item.skill.id}
                    skill={item.skill}
                    score={item.score}
                    confidence={item.confidence}
                    evidenceCount={item.evidenceCount}
                    onDetail={() => setDetailId(item.skill.id)}
                  />
                ))
              )}
            </GroupCard>
          )}

          {/* Needs more evidence */}
          {(recommendationsLoading || insufficientItems.length > 0) && (
            <GroupCard
              icon={
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              }
              title="Cần thêm bằng chứng"
              description="AI đã có một ít dữ liệu nhưng chưa đủ chắc chắn để kết luận."
              count={
                recommendationsLoading ? undefined : insufficientItems.length
              }
            >
              {recommendationsLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <Skeleton key={i} className="h-28 w-full" />
                  ))}
                </div>
              ) : (
                insufficientItems.map((item) => (
                  <NeedsEvidenceRow
                    key={item.skill.id}
                    item={item}
                    onDetail={() => setDetailId(item.skill.id)}
                    onAddEvidence={() =>
                      navigate(`/evidence?skillId=${item.skill.id}`)
                    }
                  />
                ))
              )}
            </GroupCard>
          )}

          {/* Not yet assessed */}
          {unassessedSkills.length > 0 && (
            <GroupCard
              icon={
                <Lightbulb className="h-4 w-4 text-muted-foreground" />
              }
              title="Chưa được đánh giá"
              description="Chưa có bằng chứng cho các kỹ năng này — thiếu dữ liệu không phải là yếu kém."
              count={unassessedSkills.length}
            >
              {unassessedSkills.map((skill) => (
                <UnassessedSkillRow
                  key={skill.id}
                  skill={skill}
                  onDetail={() => setDetailId(skill.id)}
                  onAddEvidence={() =>
                    navigate(`/evidence?skillId=${skill.id}`)
                  }
                />
              ))}
            </GroupCard>
          )}

          {/* Other assessed skills (not strength, confidence acceptable) */}
          {!recommendationsLoading && otherAssessed.length > 0 && (
            <GroupCard
              icon={<Target className="h-4 w-4 text-muted-foreground" />}
              title="Đã đánh giá"
              description="Các kỹ năng AI đã đánh giá nhưng chưa tới ngưỡng xác nhận điểm mạnh."
              count={otherAssessed.length}
            >
              {otherAssessed.map((skill) => (
                <AssessedSkillRow
                  key={skill.id}
                  skill={skill}
                  score={skill.score}
                  confidence={skill.confidence}
                  evidenceCount={skill.evidenceCount}
                  onDetail={() => setDetailId(skill.id)}
                />
              ))}
            </GroupCard>
          )}
        </div>
      </div>

      <SkillDetailDialog
        skillId={detailId}
        onClose={() => setDetailId(null)}
        onShowEvidence={(id) => {
          setDetailId(null);
          navigate(`/evidence?skillId=${id}`);
        }}
      />
    </div>
  );
}
