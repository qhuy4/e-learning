import { useState } from "react";
import { useSearchParams } from "react-router";
import { Info, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@fe/lib/utils";
import { Button } from "@fe/components/ui/button";
import { Badge } from "@fe/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@fe/components/ui/card";
import { Input } from "@fe/components/ui/input";
import { Label } from "@fe/components/ui/label";
import { Skeleton } from "@fe/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@fe/components/ui/select";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { getErrorMessage } from "@/shared/utils/error";
import {
  useCreateSkillEvidence,
  useDeleteSkillEvidence,
  useSkillEvidence,
  useSkillProfile,
} from "@/features/skill-profile/hooks/use-skill-profile";
import { ConfidenceBadge } from "@/features/skill-profile/components/confidence-badge";
import { scorePercent } from "@/features/skill-profile/config/skill.config";
import type {
  CreateSkillEvidenceRequest,
  SkillSourceType,
} from "@/features/skill-profile/types/skill.types";

const SOURCE_LABELS: Record<SkillSourceType, string> = {
  STUDENT_RATING: "Đánh giá học viên",
  STUDENT_OUTCOME: "Tiến độ học viên",
  LESSON_PLAN: "Phân tích bài học",
  CERTIFICATE: "Chứng chỉ",
  EXPERIENCE: "Kinh nghiệm giảng dạy",
  SELF_ASSESSMENT: "Tự đánh giá",
};

const SOURCE_ORDER: SkillSourceType[] = [
  "STUDENT_RATING",
  "STUDENT_OUTCOME",
  "LESSON_PLAN",
  "CERTIFICATE",
  "EXPERIENCE",
  "SELF_ASSESSMENT",
];

interface EvidenceForm {
  skillId: string;
  kind: "SELF_ASSESSMENT" | "EXPERIENCE";
  scorePct: string;
  years: string;
  rationale: string;
}

function emptyForm(): EvidenceForm {
  return {
    skillId: "",
    kind: "SELF_ASSESSMENT",
    scorePct: "80",
    years: "3",
    rationale: "",
  };
}

export default function EvidencePage() {
  const [searchParams] = useSearchParams();
  const { data: skills } = useSkillProfile();

  // ?skillId=... từ trang AI Skill Profile
  const skillIdParam = searchParams.get("skillId");
  const [skillFilter, setSkillFilter] = useState(skillIdParam ?? "all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [form, setForm] = useState<EvidenceForm | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Đồng bộ khi param đổi giữa chừng (render-phase, không dùng effect)
  const [seenSkillId, setSeenSkillId] = useState(skillIdParam);
  if (skillIdParam !== seenSkillId) {
    setSeenSkillId(skillIdParam);
    if (skillIdParam) setSkillFilter(skillIdParam);
  }

  const { data, isLoading } = useSkillEvidence({
    skillId: skillFilter !== "all" ? Number(skillFilter) : undefined,
    sourceType: sourceFilter !== "all" ? (sourceFilter as SkillSourceType) : undefined,
    limit: 200,
  });

  const createMut = useCreateSkillEvidence();
  const deleteMut = useDeleteSkillEvidence();

  const handleSubmit = () => {
    if (!form) return;
    if (!form.skillId) {
      toast.error("Chọn kỹ năng.");
      return;
    }
    const payload: CreateSkillEvidenceRequest =
      form.kind === "SELF_ASSESSMENT"
        ? {
            skillId: Number(form.skillId),
            sourceType: "SELF_ASSESSMENT",
            score: Math.min(Math.max(Number(form.scorePct) || 0, 0), 100) / 100,
          }
        : {
            skillId: Number(form.skillId),
            sourceType: "EXPERIENCE",
            years: Math.min(Math.max(Number(form.years) || 0, 0), 60),
          };
    if (form.rationale.trim()) payload.rationale = form.rationale.trim();

    createMut.mutate(payload, {
      onSuccess: () => {
        toast.success("Đã thêm bằng chứng — AI đã tính lại điểm skills.");
        setForm(null);
      },
      onError: (err) => toast.error(getErrorMessage(err)),
    });
  };

  const handleDelete = () => {
    if (deletingId == null) return;
    deleteMut.mutate(deletingId, {
      onSuccess: () => {
        toast.success("Đã xóa bằng chứng — AI đã tính lại điểm.");
        setDeletingId(null);
      },
      onError: (err) => {
        setDeletingId(null);
        toast.error(getErrorMessage(err));
      },
    });
  };

  const counts = data?.counts ?? {};
  const total = data?.items.length ?? 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bằng chứng</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            AI dựa vào các bằng chứng này để tính Score & Confidence. Giảng
            viên không sửa điểm trực tiếp —{" "}
            <span className="font-medium text-foreground">
              thêm / xóa bằng chứng, AI tự tính lại.
            </span>
          </p>
        </div>
        {!form && (
          <Button onClick={() => setForm(emptyForm())}>
            <Plus className="mr-1.5 h-4 w-4" />
            Thêm bằng chứng
          </Button>
        )}
      </div>

      {/* Add form */}
      {form && (
        <Card className="border-primary/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Thêm bằng chứng</CardTitle>
            <p className="text-xs text-muted-foreground">
              Tự đánh giá hoặc kinh nghiệm giảng dạy — 2 nguồn do bạn trực tiếp
              khai báo. Các nguồn khác (đánh giá học viên, bài học, chứng chỉ)
              được AI tự thu thập.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Kỹ năng</Label>
                <Select
                  value={form.skillId}
                  onValueChange={(v) =>
                    setForm({ ...form, skillId: v ?? "" })
                  }
                  items={skills?.map((skill) => ({
                    value: String(skill.id),
                    label: skill.name,
                  }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn kỹ năng" />
                  </SelectTrigger>
                  <SelectContent>
                    {skills?.map((skill) => (
                      <SelectItem key={skill.id} value={String(skill.id)}>
                        {skill.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Loại bằng chứng</Label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(["SELF_ASSESSMENT", "EXPERIENCE"] as const).map((kind) => (
                    <button
                      key={kind}
                      type="button"
                      onClick={() => setForm({ ...form, kind })}
                      className={cn(
                        "cursor-pointer rounded-lg border px-2 py-2 text-xs font-semibold transition-colors",
                        form.kind === kind
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {SOURCE_LABELS[kind]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {form.kind === "SELF_ASSESSMENT" ? (
                <div className="space-y-2">
                  <Label htmlFor="scorePct">Điểm tự đánh giá (%)</Label>
                  <Input
                    id="scorePct"
                    type="number"
                    min={0}
                    max={100}
                    className="max-w-40"
                    value={form.scorePct}
                    onChange={(e) =>
                      setForm({ ...form, scorePct: e.target.value })
                    }
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="years">Số năm kinh nghiệm</Label>
                  <Input
                    id="years"
                    type="number"
                    min={0}
                    max={60}
                    className="max-w-40"
                    value={form.years}
                    onChange={(e) => setForm({ ...form, years: e.target.value })}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="rationale">Ghi chú (tuỳ chọn)</Label>
                <Input
                  id="rationale"
                  maxLength={500}
                  placeholder="Ví dụ: 3 năm dạy IELTS Writing..."
                  value={form.rationale}
                  onChange={(e) =>
                    setForm({ ...form, rationale: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setForm(null)}>
                Hủy
              </Button>
              <Button onClick={handleSubmit} disabled={createMut.isPending}>
                {createMut.isPending ? "Đang thêm..." : "Thêm bằng chứng"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters: source chips + skill select */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setSourceFilter("all")}
          className={cn(
            "cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
            sourceFilter === "all"
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-muted-foreground hover:text-foreground",
          )}
        >
          Tất cả · {total}
        </button>
        {SOURCE_ORDER.map((type) => {
          const count = counts[type] ?? 0;
          if (count === 0 && sourceFilter !== type) return null;
          return (
            <button
              key={type}
              type="button"
              onClick={() => setSourceFilter(type)}
              className={cn(
                "cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                sourceFilter === type
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {SOURCE_LABELS[type]} · {count}
            </button>
          );
        })}

        <div className="ml-auto w-56">
          <Select
            value={skillFilter}
            onValueChange={(v) => setSkillFilter(v ?? "all")}
            items={[
              { value: "all", label: "Tất cả kỹ năng" },
              ...(skills?.map((skill) => ({
                value: String(skill.id),
                label: skill.name,
              })) ?? []),
            ]}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Lọc theo kỹ năng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả kỹ năng</SelectItem>
              {skills?.map((skill) => (
                <SelectItem key={skill.id} value={String(skill.id)}>
                  {skill.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* List */}
      <div className="rounded-lg border bg-card">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : !data?.items.length ? (
          <div className="px-4 py-12 text-center">
            <p className="text-sm font-medium">Chưa có bằng chứng nào</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Thêm tự đánh giá / kinh nghiệm, hoặc để AI tự thu thập từ đánh
              giá học viên, bài học và chứng chỉ.
            </p>
            {!form && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => setForm(emptyForm())}
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Thêm bằng chứng đầu tiên
              </Button>
            )}
          </div>
        ) : (
          <div>
            {data.items.map((ev) => (
              <div
                key={ev.id}
                className="flex flex-wrap items-center gap-3 border-b border-border/50 px-4 py-3 last:border-b-0"
              >
                <Badge variant="outline" className="shrink-0">
                  {ev.sourceLabel}
                </Badge>
                <span className="w-40 shrink-0 truncate text-sm font-semibold">
                  {ev.skillName}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                  {ev.source?.title ?? ev.rationale ?? ""}
                  {ev.source?.subtitle ? ` · ${ev.source.subtitle}` : ""}
                  {ev.source?.value ? ` · ${ev.source.value}` : ""}
                </span>
                <span className="w-12 shrink-0 text-right text-sm font-semibold tabular-nums">
                  {scorePercent(ev.score)}%
                </span>
                <ConfidenceBadge value={ev.confidence} className="shrink-0" />
                <span className="w-24 shrink-0 text-right text-xs text-muted-foreground">
                  {new Date(ev.observedAt).toLocaleDateString("vi-VN")}
                </span>
                {ev.extracted ? (
                  <span
                    className="flex w-24 shrink-0 items-center justify-end gap-1 text-[10px] text-muted-foreground"
                    title="Bằng chứng do AI tự thu thập — tự làm mới khi bạn bấm Cập nhật đánh giá"
                  >
                    <Info className="h-3 w-3" />
                    AI thu thập
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDeletingId(ev.id)}
                    title="Xóa bằng chứng"
                    className="shrink-0 cursor-pointer rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deletingId !== null}
        title="Xóa bằng chứng?"
        description="Điểm skills sẽ được AI tính lại sau khi xóa."
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  );
}
