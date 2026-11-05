import { AlertTriangle, CheckCircle2, Lightbulb } from "lucide-react";
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
  scorePercent,
  skillDescription,
  skillDisplayName,
  skillState,
} from "../config/skill.config";
import type { SkillEvidenceItem } from "../types/skill.types";

interface SkillDetailDialogProps {
  skillId: number | null;
  onClose: () => void;
}

function formatDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toLocaleString("vi-VN");
}

/** Tổng hợp điểm trung bình theo từng nguồn dữ liệu đang hiển thị. */
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
}: SkillDetailDialogProps) {
  const { data, isLoading, isError, refetch } = useSkillDetail(skillId);

  const state = data
    ? skillState(data.score, data.confidence, data.assessmentStatus)
    : null;
  const pct = scorePercent(data?.score ?? null);
  const displayName = data ? skillDisplayName(data.skill) : "Kỹ năng";
  const description = data ? skillDescription(data.skill) : null;
  const computedAt = formatDate(data?.computedAt);

  const reasons = data?.reasons ?? [];
  const evidence = data?.evidence ?? [];
  const recentEvidence = evidence.slice(0, 5);
  const averages = sourceAverages(evidence);
  const weaknesses = averages.filter((item) => item.avg < 0.5);
  const pendingRefresh =
    data != null && data.score == null && evidence.length > 0;

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
            {/* Điểm · nguồn kết quả · số nguồn */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <StatBox
                label="Điểm năng lực"
                value={pct != null ? `${pct}%` : "—"}
                hint="Mức năng lực được thể hiện qua các dữ liệu hiện có."
              />
              <StatBox
                label="Nguồn kết quả"
                value={
                  data.verifiedRatio >= 0.999
                    ? "Chứng chỉ trực tiếp"
                    : data.verifiedRatio > 0
                      ? "Kết hợp nhiều nguồn"
                      : "Dữ liệu suy luận"
                }
                hint="Cho biết kết quả được lấy trực tiếp hay được hệ thống ước tính."
              />
              <StatBox
                label="Nguồn đã dùng"
                value={String(data.evidenceCount)}
                hint="Số dữ liệu hệ thống đã dùng để đánh giá."
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
                  Chưa có dữ liệu cho kỹ năng này
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Thiếu dữ liệu{" "}
                  <span className="font-medium text-foreground">
                    không có nghĩa là bạn dạy kém
                  </span>
                  . Hệ thống chỉ kết luận khi có chứng chỉ đã duyệt hoặc đánh
                  giá hợp lệ từ học viên đã tham gia khóa học.
                </p>
              </div>
            )}

            {pendingRefresh && (
              <div className="space-y-2 rounded-lg border border-amber-300/60 bg-amber-50/50 p-4 dark:border-amber-800/60 dark:bg-amber-950/30">
                <p className="flex items-center gap-2 text-sm font-medium">
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  Đã có dữ liệu nhưng AI chưa tính điểm
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Bấm{" "}
                  <span className="font-medium text-foreground">
                    Cập nhật đánh giá
                  </span>{" "}
                  ở trang Hồ sơ kỹ năng để AI tính lại toàn bộ điểm từ dữ liệu
                  hiện có.
                </p>
              </div>
            )}

            {state === "insufficient" && (
              <div className="space-y-2 rounded-lg border border-amber-300/60 bg-amber-50/50 p-4 dark:border-amber-800/60 dark:bg-amber-950/30">
                <p className="flex items-center gap-2 text-sm font-medium">
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  Cần thêm dữ liệu để củng cố kết quả
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Điểm hiện tại chỉ là ước tính từ {data.evidenceCount} nguồn dữ
                  liệu. Thêm chứng chỉ hợp lệ hoặc nhận thêm đánh giá từ các học
                  viên độc lập sẽ củng cố kết quả.
                </p>
              </div>
            )}

            {/* Strengths */}
            {state !== "no-data" && (
              <div className="space-y-1.5">
                <h4 className="text-sm font-semibold">Điểm mạnh AI ghi nhận</h4>
                {reasons.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    AI chưa rút ra được điểm mạnh cụ thể từ dữ liệu hiện có.
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
                    Chưa thấy tín hiệu yếu rõ ràng từ dữ liệu hiện có.
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
                <h4 className="text-sm font-semibold">Dữ liệu được sử dụng</h4>
                <div className="space-y-1.5">
                  {recentEvidence.map((ev) => (
                    <div
                      key={ev.id}
                      className="flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2"
                    >
                      <Badge
                        variant="secondary"
                        className="shrink-0 text-[10px]"
                      >
                        {ev.sourceLabel}
                      </Badge>
                      <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                        {ev.source?.title ?? ev.rationale ?? "Nguồn dữ liệu"}
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
                    Đang hiển thị {recentEvidence.length}/{data.evidenceCount}{" "}
                    nguồn dữ liệu gần nhất.
                  </p>
                )}
              </div>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
