import { LISTENING_SECTIONS, READING_PASSAGES } from "./constants";
import { IELTS_SPEAKING_PARTS } from "./mocks/speaking-data";
import { IELTS_WRITING_TASKS } from "./mocks/writing-data";
import type { IeltsModule, IeltsScope, ObjectiveModule } from "./types";

/**
 * Scope helpers — the practice scope ("luyện từng phần") is stored in the exam
 * context and mirrored in the URL:
 *
 *   /ielts/test/listening?section=1,3   → scope.listening = [1, 3]
 *   /ielts/test/reading?passage=2       → scope.reading   = [2]
 *   /ielts/test/writing?task=2          → scope.writing   = [2]
 *   /ielts/test/speaking?part=1         → scope.speaking  = [1]
 *
 * Group ids are 1-based per module (section / passage / task / part).
 * An empty scope means the whole module is in play.
 */

/**
 * Valid group ids per module — tính LÚC GỌI từ config ĐANG SỐNG (các mảng
 * const được splice theo data DB khi vào API mode), không snapshot lúc
 * load module (D6: scope cũ sẽ chặn group id hợp lệ của đề thật).
 */
export function scopeGroupsOf(module: IeltsModule): number[] {
  if (module === "listening") return LISTENING_SECTIONS.map((s) => s.section);
  if (module === "reading") return READING_PASSAGES.map((p) => p.passage);
  if (module === "writing") return IELTS_WRITING_TASKS.map((t) => t.id);
  return IELTS_SPEAKING_PARTS.map((p) => p.part);
}

/** URL query key per module ("?section=2" / "?passage=2" / "?task=2" / "?part=2"). */
export const SCOPE_PARAM: Record<IeltsModule, string> = {
  listening: "section",
  reading: "passage",
  writing: "task",
  speaking: "part",
};

/**
 * Parses a comma list ("1,3") into valid group ids for the module.
 * Unknown / out-of-range / non-numeric entries are ignored.
 * Returns a sorted, de-duplicated list (empty = no scope).
 */
export function parseScopeParam(module: IeltsModule, raw: string | null): number[] {
  if (raw === null) return [];
  const allowed = scopeGroupsOf(module);
  const seen = new Set<number>();
  raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .forEach((part) => {
      const value = Number(part);
      if (Number.isInteger(value) && allowed.includes(value)) seen.add(value);
    });
  return allowed.filter((id) => seen.has(id));
}

/** Active group ids of a module — `null` means "no scope = everything". */
export function scopeGroups(module: IeltsModule, scope: IeltsScope): number[] | null {
  const ids = scope[module];
  return ids && ids.length > 0 ? ids : null;
}

/** Whether a single group (section / passage / task / part) is inside the scope. */
export function inScope(module: IeltsModule, group: number, scope: IeltsScope): boolean {
  const ids = scopeGroups(module, scope);
  return ids === null || ids.includes(group);
}

/** Global question ids (Listening 1–40, Reading 41–80) covered by the scope. */
export function scopeQuestionIds(module: ObjectiveModule, scope: IeltsScope): number[] {
  const groups = scopeGroups(module, scope);
  const ids: number[] = [];
  if (module === "listening") {
    const configs = groups
      ? LISTENING_SECTIONS.filter((s) => groups.includes(s.section))
      : LISTENING_SECTIONS;
    configs.forEach((s) => {
      for (let id = s.from; id <= s.to; id += 1) ids.push(id);
    });
  } else {
    const configs = groups
      ? READING_PASSAGES.filter((p) => groups.includes(p.passage))
      : READING_PASSAGES;
    configs.forEach((p) => {
      for (let id = p.from; id <= p.to; id += 1) ids.push(id);
    });
  }
  return ids;
}

/** Human labels of the scoped groups, e.g. "Section 2" / "Passage 1, Passage 3". */
export function scopeLabels(module: IeltsModule, scope: IeltsScope): string | null {
  const groups = scopeGroups(module, scope);
  if (groups === null) return null;
  if (module === "listening") {
    return LISTENING_SECTIONS.filter((s) => groups.includes(s.section))
      .map((s) => s.label)
      .join(", ");
  }
  if (module === "reading") {
    return READING_PASSAGES.filter((p) => groups.includes(p.passage))
      .map((p) => p.label)
      .join(", ");
  }
  const noun = module === "writing" ? "Task" : "Part";
  return groups.map((id) => `${noun} ${id}`).join(", ");
}

/** Query string carrying the scope, e.g. "?section=2,3" ("" when unscoped). */
export function scopeSearch(module: IeltsModule, scope: IeltsScope): string {
  const groups = scopeGroups(module, scope);
  if (groups === null) return "";
  return `?${SCOPE_PARAM[module]}=${groups.join(",")}`;
}

/**
 * Position of a question inside the scoped id range (1-based) plus the scoped
 * total — used by headers/rails so a section-2-only run reads "1/10".
 */
export function scopedPosition(
  module: ObjectiveModule,
  scope: IeltsScope,
  questionId: number,
): { position: number; total: number; scoped: boolean } {
  const ids = scopeQuestionIds(module, scope);
  const scoped = scopeGroups(module, scope) !== null;
  const index = ids.indexOf(questionId);
  if (index === -1) {
    // Số câu Listening THẬT (suy từ config đang dùng) — không hardcode 40.
    const listeningBase = LISTENING_SECTIONS.reduce((m, s) => Math.max(m, s.to), 0);
    const fallback = module === "listening" ? questionId : questionId - listeningBase;
    return { position: fallback, total: ids.length, scoped };
  }
  return { position: index + 1, total: ids.length, scoped };
}
