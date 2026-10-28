import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { SkillSummary } from "../types/skill.types";
import { shortSkillLabel, skillDisplayName } from "../config/skill.config";

interface SkillRadarChartProps {
  skills: SkillSummary[];
  height?: number;
}

/**
 * Radar chỉ vẽ skill ĐÃ có điểm — score = null nghĩa là "chưa đủ dữ liệu",
 * không phải 0, nên không vẽ lên trục (tránh bị hiểu nhầm là yếu).
 */
export function SkillRadarChart({ skills, height = 300 }: SkillRadarChartProps) {
  const data = skills
    .filter((s) => s.score != null)
    .map((s) => {
      const displayName = skillDisplayName(s);
      return {
        name: shortSkillLabel(displayName),
        fullName: displayName,
        score: s.score as number,
        confidence: s.confidence,
      };
    });

  if (data.length < 3) {
    return (
      <div className="flex h-[300px] flex-col items-center justify-center gap-2 text-center">
        <p className="text-sm font-medium">Chưa đủ dữ liệu cho radar</p>
        <p className="max-w-64 text-xs text-muted-foreground">
          Radar cần ít nhất 3 kỹ năng có điểm. Thêm bằng chứng để AI tính điểm.
        </p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid className="stroke-[var(--border)]" />
        <PolarAngleAxis dataKey="name" tick={{ fontSize: 11 }} />
        <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 1]} />
        <Radar
          dataKey="score"
          className="fill-emerald-500/30 stroke-emerald-600 dark:stroke-emerald-400"
          strokeWidth={2}
          isAnimationActive={false}
        />
        <Tooltip
          formatter={(value) => `${Math.round(Number(value) * 100)}%`}
          labelFormatter={(label) =>
            data.find((d) => d.name === label)?.fullName ?? String(label)
          }
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
