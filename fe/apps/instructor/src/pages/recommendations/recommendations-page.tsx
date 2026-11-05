import { useNavigate } from "react-router";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  FileSearch,
  Lightbulb,
} from "lucide-react";
import { Button } from "@fe/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@fe/components/ui/card";
import { Badge } from "@fe/components/ui/badge";
import { Skeleton } from "@fe/components/ui/skeleton";
import { ConfidenceBadge } from "@/features/skill-profile/components/confidence-badge";
import { scorePercent } from "@/features/skill-profile/config/skill.config";
import {
  useDismissSkillRecommendation,
  useSkillRecommendations,
} from "@/features/skill-profile/hooks/use-skill-profile";

export default function RecommendationsPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useSkillRecommendations();
  const dismiss = useDismissSkillRecommendation();

  const strengths = data?.strengths ?? [];
  const limited = data?.limited ?? [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Khuyến nghị</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          AI phân tích hồ sơ của bạn:{" "}
          <span className="font-medium text-foreground">điểm mạnh</span> cần
          phát huy và{" "}
          <span className="font-medium text-foreground">
            kỹ năng confidence thấp
          </span>{" "}
          cần bổ sung bằng chứng — kèm lý do vì sao.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Strengths */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Điểm mạnh của bạn
              {strengths.length > 0 && (
                <Badge variant="secondary" className="text-[11px]">
                  {strengths.length}
                </Badge>
              )}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Score cao AND confidence cao — AI đủ dữ liệu để khẳng định.
            </p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : strengths.length === 0 ? (
              <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                Chưa có điểm mạnh nào — cần score ≥ 65% với confidence ≥ 60%.
                Thêm bằng chứng để AI đủ dữ liệu kết luận.
              </p>
            ) : (
              <div className="space-y-2">
                {strengths.map((item) => (
                  <div
                    key={item.skill.id}
                    className="flex items-center gap-3 rounded-lg border px-3 py-2.5"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {item.skill.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.evidenceCount} bằng chứng
                      </p>
                    </div>
                    <span className="text-lg font-bold tabular-nums">
                      {scorePercent(item.score)}%
                    </span>
                    <ConfidenceBadge value={item.confidence} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Limited evidence */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              Confidence còn thấp
              {limited.length > 0 && (
                <Badge variant="secondary" className="text-[11px]">
                  {limited.length}
                </Badge>
              )}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              AI chưa đủ dữ liệu để chấm chắc — mỗi mục kèm cách cải thiện.
            </p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : limited.length === 0 ? (
              <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                Tuyệt vời — mọi kỹ năng đều có confidence đủ cao.
              </p>
            ) : (
              <div className="space-y-3">
                {limited.map((item) => (
                  <div
                    key={item.skill.id}
                    className="rounded-lg border border-amber-300/60 bg-amber-50/50 p-3 dark:border-amber-800/60 dark:bg-amber-950/30"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex-1 text-sm font-semibold">
                        {item.skill.name}
                      </span>
                      <span className="text-sm font-bold tabular-nums text-amber-700 dark:text-amber-400">
                        {item.confidence != null
                          ? `Confidence ${Math.round(item.confidence * 100)}%`
                          : "Chưa có dữ liệu"}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {item.reason}
                      {item.score != null &&
                        ` · Score hiện tại ${scorePercent(item.score)}%`}
                    </p>

                    {item.actions.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <p className="text-xs font-medium">
                          Để cải thiện confidence:
                        </p>
                        {item.actions.map((action) => (
                          <div
                            key={action.type}
                            className="flex items-start gap-1.5 text-xs text-muted-foreground"
                          >
                            <span className="text-primary">→</span>
                            <span className="flex-1">{action.label}</span>
                            {action.recommendationId &&
                              action.status === "ACTIVE" && (
                                <button
                                  type="button"
                                  className="text-muted-foreground hover:text-foreground"
                                  onClick={() =>
                                    dismiss.mutate(action.recommendationId!)
                                  }
                                >
                                  Bỏ qua
                                </button>
                              )}
                          </div>
                        ))}
                      </div>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 h-7 px-2 text-xs"
                      onClick={() =>
                        navigate(`/evidence?skillId=${item.skill.id}`)
                      }
                    >
                      <FileSearch className="mr-1 h-3.5 w-3.5" />
                      Xem evidence
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Footer note */}
      <div className="flex items-start gap-2 rounded-lg border border-dashed px-4 py-3 text-xs text-muted-foreground">
        <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>
          AI không cho sửa điểm. Thêm bằng chứng trên trang Evidence (hoặc{" "}
          <button
            type="button"
            onClick={() => navigate("/teaching-profile")}
            className="cursor-pointer font-medium text-primary hover:underline"
          >
            hoàn thiện Hồ sơ giảng dạy
          </button>
          ), rồi bấm "Cập nhật đánh giá" — AI sẽ chạy lại toàn bộ skill profile.{" "}
          <button
            type="button"
            onClick={() => navigate("/skill-profile")}
            className="inline-flex cursor-pointer items-center gap-0.5 font-medium text-primary hover:underline"
          >
            Xem chi tiết AI
            <ArrowRight className="h-3 w-3" />
          </button>
        </span>
      </div>
    </div>
  );
}
