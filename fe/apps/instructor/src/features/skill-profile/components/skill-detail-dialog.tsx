import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  FileSearch,
  Lightbulb,
} from "lucide-react";
import { Button } from "@fe/components/ui/button";
import { Badge } from "@fe/components/ui/badge";
import { Skeleton } from "@fe/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@fe/components/ui/dialog";
import { useSkillDetail } from "../hooks/use-skill-profile";
import {
  SKILL_STATE_META,
  confidenceLabel,
  scorePercent,
  skillDescription,
  skillDisplayName,
  skillState,
} from "../config/skill.config";
import type { SkillEvidenceItem } from "../types/skill.types";

interface SkillDetailDialogProps {
  skillId: number | null;
  onClose: () => void;
  onShowEvidence: (skillId: number) => void;
}

function formatDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toLocaleString("vi-VN");
}

/** Tổng hợp điểm trung bình theo từng nguồn bằng chứng đang hiển thị. */
function sourceAverages(items: SkillEvidenceItem[]) {
  const map = new Map<string, { count: number; total: number }>();
  for (const item of items) {
    const group = map.get(item.sourceLabel) ?? { count: 0, total: 0 };
    group.count += 1;
    group.total += item.score;
    map.set(item.sourceLabel, group);
  }
  return [...map.entries()]
    .map(([label, group]) => ({
      label,
      count: group.count,
      avg: group.total / group.count,
    }))
    .sort((a, b) => b.avg - a.avg);
}

function StatBox({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-lg border p-3">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-bold tabular-nums">{value}</div>
      <div className="mt-1 text-[11px] leading-snug text-muted-foreground">
        {hint}
      </div>
    </div>
  );
}

export function SkillDetailDialog({
  skillId,
  onClose,
  onShowEvidence,
}: SkillDetailDialogProps) {
  const { data, isLoading, isError, refetch } = useSkillDetail(skillId);

  const state = data ? skillState(data.score, data.confidence) : null;
  const pct = scorePercent(data?.score ?? null);
  const displayName = data ? skillDisplayName(data.skill) : "Kỹ năng";
  const description = data ? skillDescription(data.skill) : null;
  const computedAt = formatDate(data?.computedAt);

  const reasons = data?.reasons ?? [];
  const evidence = data?.evidence ?? [];
  const recentEvidence = evidence.slice(0, 5);
  const averages = sourceAverages(evidence);
  const weaknesses = averages.filter((item) => item.avg < 0.5);
  const pendingRefresh = data != null && data.score == null && evidence.length > 0;

  return (
    <Dialog open={skillId != null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            {displayName}
            {state && (
              <Badge
                variant="outline"
                className={SKILL_STATE_META[state].badgeClass}
              >
                {SKILL_STATE_META[state].label}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed p-4">
            <p className="flex items-center gap-2 text-sm font-medium">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              Không tải được chi tiết kỹ năng này
            </p>
            <p className="text-xs text-muted-foreground">
              Kết quả đánh giá của bạn vẫn được giữ nguyên. Vui lòng thử lại.
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Thử lại
            </Button>
          </div>
        ) : data ? (
          <div className="space-y-4">
            {/* Score · Confidence · Evidence */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <StatBox
                label="Score"
                value={pct != null ? `${pct}%` : "—"}
                hint="AI đánh giá kỹ năng này mạnh đến đâu (0–100%)."
              />
              <StatBox
                label="Confidence"
                value={
                  data.confidence != null
                    ? `${Math.round(data.confidence * 100)}% · ${confidenceLabel(data.confidence)}`
                    : "Chưa đủ dữ liệu"
                }
                hint="AI chắc chắn đến đâu về đánh giá này."
              />
              <StatBox
                label="Evidence"
                value={String(data.evidenceCount)}
                hint="Số bằng chứng AI đã dùng để đánh giá."
              />
            </div>

            {computedAt && (
              <p className="text-xs text-muted-foreground">
                Đánh giá lần cuối: {computedAt}
              </p>
            )}

            {/* State guidance */}
            {state === "no-data" && !pendingRefresh && (
              <div className="space-y-2 rounded-lg border border-dashed p-4">
                <p className="flex items-center gap-2 text-sm font-medium">
                  <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  Chưa có bằng chứng cho kỹ năng này
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Thiếu dữ liệu <span className="font-medium text-foreground">không có nghĩa là bạn dạy kém</span>.
                  AI chỉ kết luận khi có bằng chứng. Bạn có thể thêm tự đánh giá
                  hoặc kinh nghiệm giảng dạy, hoàn thiện Hồ sơ giảng dạy, thêm
                  chứng chỉ, hoặc chờ AI thu thập từ đánh giá học viên, bài học
                  và tiến độ học viên.
                </p>
              </div>
            )}

            {pendingRefresh && (
              <div className="space-y-2 rounded-lg border border-amber-300/60 bg-amber-50/50 p-4 dark:border-amber-800/60 dark:bg-amber-950/30">
                <p className="flex items-center gap-2 text-sm font-medium">
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  Đã có bằng chứng nhưng AI chưa tính điểm
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Bấm <span className="font-medium text-foreground">Cập nhật đánh giá</span>{" "}
                  ở trang Hồ sơ kỹ năng để AI tính lại toàn bộ điểm từ bằng chứng
                  hiện có.
                </p>
              </div>
            )}

            {state === "insufficient" && (
              <div className="space-y-2 rounded-lg border border-amber-300/60 bg-amber-50/50 p-4 dark:border-amber-800/60 dark:bg-amber-950/30">
                <p className="flex items-center gap-2 text-sm font-medium">
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  AI cần thêm bằng chứng để kết luận chắc chắn
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Điểm hiện tại chỉ là ước tính từ {data.evidenceCount} bằng chứng.
                  Thêm bằng chứng từ nguồn khác — đánh giá học viên, bài học,
                  chứng chỉ hoặc tiến độ học viên — sẽ giúp AI tự tin hơn.
                </p>
              </div>
            )}

            {/* Strengths */}
            {state !== "no-data" && (
              <div className="space-y-1.5">
                <h4 className="text-sm font-semibold">Điểm mạnh AI ghi nhận</h4>
                {reasons.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    AI chưa rút ra được điểm mạnh cụ thể từ bằng chứng hiện có.
                  </p>
                ) : (
                  <ul className="space-y-1">
                    {reasons.map((reason) => (
                      <li
                        key={reason}
                        className="flex items-start gap-1.5 text-sm"
                      >
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Weaknesses */}
            {state !== "no-data" && (
              <div className="space-y-1.5">
                <h4 className="text-sm font-semibold">Cần cải thiện</h4>
                {weaknesses.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Chưa thấy tín hiệu yếu rõ ràng từ các bằng chứng hiện có.
                  </p>
                ) : (
                  <ul className="space-y-1">
                    {weaknesses.map((item) => (
                      <li
                        key={item.label}
                        className="flex items-start gap-1.5 text-sm"
                      >
                        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                        <span>
                          {item.label}: điểm trung bình{" "}
                          {Math.round(item.avg * 100)}% qua {item.count} bằng
                          chứng gần đây.
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Supporting evidence */}
            {recentEvidence.length > 0 && (
              <div className="space-y-1.5">
                <h4 className="text-sm font-semibold">Bằng chứng gần đây</h4>
                <div className="space-y-1.5">
                  {recentEvidence.map((ev) => (
                    <div
                      key={ev.id}
                      className="flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2"
                    >
                      <Badge variant="secondary" className="shrink-0 text-[10px]">
                        {ev.sourceLabel}
                      </Badge>
                      <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                        {ev.source?.title ?? ev.rationale ?? "Bằng chứng"}
                        {ev.source?.value ? ` · ${ev.source.value}` : ""}
                      </span>
                      <span className="shrink-0 text-xs font-semibold tabular-nums">
                        {Math.round(ev.score * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
                {data.evidenceCount > recentEvidence.length && (
                  <p className="text-xs text-muted-foreground">
                    Đang hiển thị {recentEvidence.length}/{data.evidenceCount} bằng
                    chứng. Xem tất cả ở trang Bằng chứng.
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onShowEvidence(data.skill.id)}
              >
                <FileSearch className="mr-1.5 h-4 w-4" />
                {pendingRefresh
                  ? "Xem bằng chứng"
                  : state === "no-data"
                    ? "Thêm bằng chứng"
                    : "Xem tất cả bằng chứng"}
                <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
