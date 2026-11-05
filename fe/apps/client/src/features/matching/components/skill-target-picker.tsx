import { Checkbox } from "@fe/components/ui/checkbox";
import { Skeleton } from "@fe/components/ui/skeleton";
import { useI18n } from "@/i18n/use-i18n";
import type { SkillOption } from "../types/matching.type";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@fe/components/ui/select.tsx";

const MIN_PRIORITY = 1;
const MAX_PRIORITY = 5;
export const DEFAULT_PRIORITY = 3;

interface SkillTargetPickerProps {
    skills: SkillOption[];
    loading: boolean;
    /** skillId → mức ưu tiên 1–5 (mặc định 3). */
    selected: Record<number, number>;
    onToggle: (skillId: number, checked: boolean) => void;
    onWeightChange: (skillId: number, weight: number) => void;
}

/**
 * Chọn nhiều skill cần cải thiện + mức ưu tiên thang 1–5
 * (1 = ít ưu tiên, 5 = rất ưu tiên).
 */
export function SkillTargetPicker({
    skills,
    loading,
    selected,
    onToggle,
    onWeightChange,
}: SkillTargetPickerProps) {
    const { t } = useI18n();

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Array.from({ length: 6 }, (_, i) => (
                    <Skeleton key={i} className="h-12 rounded-xl" />
                ))}
            </div>
        );
    }

    if (skills.length === 0) {
        return (
            <p className="text-xs text-muted-foreground">
                {t("match.picker.empty")}
            </p>
        );
    }
    const PRIORITY_OPTIONS = Array.from(
        { length: MAX_PRIORITY - MIN_PRIORITY + 1 },
        (_, i) => MIN_PRIORITY + i,
    );
    const clamp = (value: number): number =>
        Math.min(MAX_PRIORITY, Math.max(MIN_PRIORITY, Math.round(value)));

    return (
        <div className="flex flex-col gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {skills.map((skill) => {
                    const isSelected = skill.id in selected;
                    return (
                        <div
                            key={skill.id}
                            className={`flex flex-col gap-2 rounded-xl border px-4 py-3 transition-colors ${
                                isSelected
                                    ? "border-primary bg-primary/5"
                                    : "border-border bg-card hover:border-input"
                            }`}
                        >
                            {/* Row 1: checkbox + tên — input ưu tiên xuống hàng riêng */}
                            <label className="flex items-center gap-3 cursor-pointer min-w-0">
                                <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={(checked) =>
                                        onToggle(skill.id, checked === true)
                                    }
                                />
                                <span className="flex-1 min-w-0 text-sm font-semibold text-foreground leading-snug break-words">
                                    {skill.name}
                                </span>
                            </label>

                            {isSelected && (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground font-medium shrink-0">
                                        {t("match.picker.weight")}
                                    </span>
                                    <Select
                                        value={String(selected[skill.id])}
                                        onValueChange={(v) =>
                                            onWeightChange(
                                                skill.id,
                                                clamp(Number(v)),
                                            )
                                        }
                                    >
                                        <SelectTrigger
                                            className="text-xs font-bold"
                                            aria-label={`${t("match.picker.weight")} — ${skill.name}`}
                                        >
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent side="bottom">
                                            {PRIORITY_OPTIONS.map((n) => (
                                                <SelectItem
                                                    key={n}
                                                    value={String(n)}
                                                    className="text-xs font-bold"
                                                >
                                                    {n}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {Object.keys(selected).length > 0 && (
                <p className="text-xs text-muted-foreground">
                    {t("match.picker.scale")}
                </p>
            )}
        </div>
    );
}
