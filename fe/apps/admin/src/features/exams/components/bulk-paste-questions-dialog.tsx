import { useMemo, useState } from "react";
import { AlertTriangle, ClipboardPaste, CheckCircle2, FileText, FolderPlus } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@fe/components/ui/badge";
import { Button } from "@fe/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@fe/components/ui/dialog";
import { Label } from "@fe/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@fe/components/ui/select";
import { Textarea } from "@fe/components/ui/textarea";
import {
  useCreateExamGroupMaterial,
  useCreateExamQuestion,
  useCreateExamQuestionInSection,
  useCreateExamQuestionGroup,
  useExamGroupMaterials,
  useExamQuestions,
} from "../hooks/use-exams";
import {
  ExamGroupType,
  ExamMaterialType,
  QUESTION_GROUP_TYPE_LABELS,
  QUESTION_TYPE_LABELS,
  QuestionType,
} from "../types/exam";
import type {
  AdminExamQuestionGroup,
  AdminExamSection,
  CreateExamGroupMaterialDto,
  CreateExamQuestionDto,
} from "../types/exam";

interface BulkPasteQuestionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Phần thi đang xem — câu dán trực tiếp sẽ vào đây. */
  section: AdminExamSection;
  /** Các nhóm của phần thi — chọn 1 nhóm để dán câu vào nhóm đó. */
  groups: AdminExamQuestionGroup[];
  /** Số câu trực lập hiện có — dùng tính position khi thêm. */
  directCount: number;
}

/** 1 dòng đã parse: câu hỏi hoặc lệnh (#group/#direct/#audio…), hoặc lỗi. */
interface ParsedLine {
  line: number;
  kind: "question" | "group" | "direct" | "material";
  ok: boolean;
  error?: string;
  dto?: CreateExamQuestionDto;
  groupType?: ExamGroupType;
  groupTitle?: string;
  material?: CreateExamGroupMaterialDto;
}

/** Mục tiêu thêm: câu trực lập / 1 nhóm có sẵn / 1 nhóm sắp tạo (#group). */
type Target = { kind: "direct" } | { kind: "group"; id: number } | { kind: "new"; idx: number };

interface PlanGroup {
  line: number;
  groupType: ExamGroupType;
  title?: string;
}
interface PlanWork {
  item: ParsedLine;
  target: Target;
}
interface PastePlan {
  errors: ParsedLine[];
  newGroups: PlanGroup[];
  works: PlanWork[];
  questions: PlanWork[];
  materials: PlanWork[];
  total: number;
}

const MC_ANSWER_RE = /^[A-D]{1,4}$/;
const LETTERS = "ABCD";
const DIRECT_TARGET = "direct";

/** Tiền tố loại câu hỏi ở trường đầu (tiện ích mở rộng so với suy luận theo số trường). */
const TYPE_TAGS: Record<string, QuestionType> = {
  MC: QuestionType.MULTIPLE_CHOICE,
  MULTIPLE_CHOICE: QuestionType.MULTIPLE_CHOICE,
  MS: QuestionType.MULTI_SELECT,
  MULTI_SELECT: QuestionType.MULTI_SELECT,
  TF: QuestionType.TRUE_FALSE,
  TRUEFALSE: QuestionType.TRUE_FALSE,
  TRUE_FALSE: QuestionType.TRUE_FALSE,
  DUNG_SAI: QuestionType.TRUE_FALSE,
  FB: QuestionType.FILL_BLANK,
  FILL: QuestionType.FILL_BLANK,
  BLANK: QuestionType.FILL_BLANK,
  FILL_BLANK: QuestionType.FILL_BLANK,
  FILLINTHEBLANK: QuestionType.FILL_BLANK,
  DONG_DU: QuestionType.FILL_BLANK,
  SA: QuestionType.SHORT_ANSWER,
  SHORT: QuestionType.SHORT_ANSWER,
  SHORTANSWER: QuestionType.SHORT_ANSWER,
  SHORT_ANSWER: QuestionType.SHORT_ANSWER,
  MT: QuestionType.MATCHING,
  MATCH: QuestionType.MATCHING,
  MATCHING: QuestionType.MATCHING,
  ES: QuestionType.ESSAY,
  ESSAY: QuestionType.ESSAY,
  AR: QuestionType.AUDIO_RECORD,
  RECORD: QuestionType.AUDIO_RECORD,
  AUDIO_RECORD: QuestionType.AUDIO_RECORD,
};

const GROUP_TYPE_KEYWORDS: Record<string, ExamGroupType> = {
  AUDIO: ExamGroupType.AUDIO,
  PASSAGE: ExamGroupType.PASSAGE,
  IMAGE: ExamGroupType.IMAGE,
  CUSTOM: ExamGroupType.CUSTOM,
};

const MATERIAL_CMDS: Record<string, ExamMaterialType> = {
  audio: ExamMaterialType.AUDIO,
  image: ExamMaterialType.IMAGE,
  passage: ExamMaterialType.PASSAGE,
  text: ExamMaterialType.TEXT,
};

const SYNTAX_HELP = [
  "Trắc nghiệm:     câu hỏi | A | B | C | D | A   (nhiều đáp án ghi: AC)",
  "Điền chỗ trống:  câu hỏi | đáp án",
  "Tiền tố loại:    MC|câu|A|B|C|D|A    MS|câu|A|B|C|D|AC",
  "                 TF|câu hỏi|TRUE     FB|câu|đáp án     SA|câu|đáp án",
  "Nối đáp án:      MT|câu hỏi|trái=phải|trái=phải",
  "Tự luận/Thu âm:  ES|câu hỏi    AR|câu hỏi",
  "",
  "Nhóm mới:        #group    #group AUDIO | Tiêu đề nhóm",
  "Về câu trực lập: #direct",
  "Tài liệu nhóm:   #audio <url>   #image <url>",
  "                 #passage <nội dung>   #text <nội dung>",
  "",
  'Ô "Thêm vào" là mục tiêu ban đầu; #group / #direct đổi',
  "giữa chừng. Dòng trống hoặc # không phải lệnh sẽ bị bỏ qua.",
].join("\n");

function failParse(line: number, kind: ParsedLine["kind"], error: string): ParsedLine {
  return { line, kind, ok: false, error };
}

/**
 * Parse 1 dòng thành câu hỏi theo `type` (all[0] = câu hỏi, còn lại = phần phụ).
 * - Chọn (MC/MS): 6 trường, đáp án là chữ cái A–D (nhiều chữ → nhiều đáp án);
 * - Đúng/Sai: `TF | câu | TRUE/FALSE` (+ tùy chỉnh nhãn 2 cột);
 * - Điền chỗ / Trả lời ngắn: `FB | câu | đáp án`;
 * - Nối: `MT | câu | trái=phải | …`;
 * - Tự luận / Thu âm: `ES | câu` (không kèm đáp án).
 */
function buildQuestion(
  all: string[],
  type: QuestionType,
  explicit: boolean,
  line: number,
): ParsedLine {
  const fail = (error: string) => failParse(line, "question", error);
  const question = all[0] ?? "";
  const rest = all.slice(1);
  if (!question) return fail("Thiếu nội dung câu hỏi.");

  if (type === QuestionType.MULTIPLE_CHOICE || type === QuestionType.MULTI_SELECT) {
    if (rest.length !== 5) {
      return fail(
        `Trắc nghiệm cần 6 trường (câu hỏi | A | B | C | D | đáp án) — nhận ${all.length} trường.`,
      );
    }
    const [a, b, c, d, answer] = rest;
    if (!a || !b || !c || !d) {
      return fail("Phải đủ 4 phương án A–D, không được để trống giữa dòng.");
    }
    const letters = answer.toUpperCase().replace(/\s+/g, "");
    if (!MC_ANSWER_RE.test(letters)) {
      return fail(`Đáp án phải là chữ cái A–D (vd: A hoặc AC) — nhận "${answer}".`);
    }
    const unique = [...new Set(letters.split(""))];
    if (explicit && type === QuestionType.MULTIPLE_CHOICE && unique.length > 1) {
      return fail(`Tag MC chỉ 1 đáp án đúng — dùng MS cho nhiều đáp án (nhận "${letters}").`);
    }
    const finalType: QuestionType = explicit
      ? type
      : unique.length > 1
        ? QuestionType.MULTI_SELECT
        : QuestionType.MULTIPLE_CHOICE;
    return {
      line,
      kind: "question",
      ok: true,
      dto: {
        type: finalType,
        question,
        points: 1,
        position: 0,
        options: [a, b, c, d].map((content, i) => ({
          content,
          isCorrect: unique.includes(LETTERS[i]),
          position: i + 1,
        })),
      },
    };
  }

  if (type === QuestionType.TRUE_FALSE) {
    if (rest.length < 1 || rest.length > 3) {
      return fail(`TF cần: TF | câu hỏi | TRUE (hoặc FALSE) — nhận ${all.length} trường.`);
    }
    const token = rest[0].toUpperCase();
    const isTrue = /^(TRUE|ĐÚNG|T|A)$/.test(token);
    const isFalse = /^(FALSE|SAI|F|B)$/.test(token);
    if (!isTrue && !isFalse) {
      return fail(`Đáp án TF phải là TRUE/FALSE (hoặc ĐÚNG/SAI) — nhận "${rest[0]}".`);
    }
    return {
      line,
      kind: "question",
      ok: true,
      dto: {
        type: QuestionType.TRUE_FALSE,
        question,
        points: 1,
        position: 0,
        options: [
          { content: rest[1] || "True", isCorrect: isTrue, position: 1 },
          { content: rest[2] || "False", isCorrect: !isTrue, position: 2 },
        ],
      },
    };
  }

  if (type === QuestionType.FILL_BLANK || type === QuestionType.SHORT_ANSWER) {
    const tag = type === QuestionType.FILL_BLANK ? "FB" : "SA";
    if (rest.length !== 1) {
      return fail(`${tag} cần: ${tag} | câu hỏi | đáp án — nhận ${all.length} trường.`);
    }
    const answer = rest[0];
    if (!answer) return fail("Thiếu đáp án (trường thứ 2).");
    return {
      line,
      kind: "question",
      ok: true,
      dto: {
        type,
        question,
        points: 1,
        position: 0,
        options: [{ content: answer, isCorrect: true, position: 1 }],
      },
    };
  }

  if (type === QuestionType.MATCHING) {
    if (rest.length < 2) {
      return fail(
        `MT cần ít nhất 2 cặp: MT | câu hỏi | trái=phải | trái=phải — nhận ${rest.length} cặp.`,
      );
    }
    const pairs: { left: string; right: string }[] = [];
    for (let i = 0; i < rest.length; i++) {
      const eq = rest[i].indexOf("=");
      if (eq <= 0 || eq === rest[i].length - 1) {
        return fail(`Cặp nối thứ ${i + 1} sai định dạng "trái=phải" — nhận "${rest[i]}".`);
      }
      const left = rest[i].slice(0, eq).trim();
      const right = rest[i].slice(eq + 1).trim();
      if (!left || !right) {
        return fail(`Cặp nối thứ ${i + 1} sai định dạng "trái=phải" — nhận "${rest[i]}".`);
      }
      pairs.push({ left, right });
    }
    const options: CreateExamQuestionDto["options"] = [];
    pairs.forEach((pair, i) => {
      options!.push({ content: pair.left, isCorrect: false, position: i * 2 + 1 });
      options!.push({ content: pair.right, isCorrect: true, position: i * 2 + 2 });
    });
    return {
      line,
      kind: "question",
      ok: true,
      dto: { type: QuestionType.MATCHING, question, points: 1, position: 0, options },
    };
  }

  // ESSAY / AUDIO_RECORD — không kèm đáp án.
  if (rest.length > 0) {
    const tag = type === QuestionType.ESSAY ? "ES" : "AR";
    return fail(`${tag} chỉ cần: ${tag} | câu hỏi — không có trường đáp án phụ.`);
  }
  return {
    line,
    kind: "question",
    ok: true,
    dto: { type, question, points: 1, position: 0, options: [] },
  };
}

/** Lệnh bắt đầu bằng "#": #group / #direct / #audio / #image / #passage / #text. */
function parseDirective(trimmed: string, line: number): ParsedLine | null {
  const match = /^#([a-zA-Z_]+)\s*(.*)$/.exec(trimmed);
  if (!match) return null;
  const cmd = match[1].toLowerCase();
  const restStr = match[2].trim();

  if (cmd === "group") {
    const parts = restStr === "" ? [] : restStr.split("|").map((p) => p.trim());
    if (parts.length === 0) {
      return { line, kind: "group", ok: true, groupType: ExamGroupType.CUSTOM };
    }
    if (parts.length === 1) {
      const keyword = GROUP_TYPE_KEYWORDS[parts[0].toUpperCase()];
      if (keyword) return { line, kind: "group", ok: true, groupType: keyword };
      return {
        line,
        kind: "group",
        ok: true,
        groupType: ExamGroupType.CUSTOM,
        groupTitle: parts[0],
      };
    }
    if (parts[0] === "") {
      // "#group | Tiêu đề" — bỏ trống loại → CUSTOM.
      const title = parts.slice(1).join(" | ").trim();
      return {
        line,
        kind: "group",
        ok: true,
        groupType: ExamGroupType.CUSTOM,
        groupTitle: title || undefined,
      };
    }
    const keyword = GROUP_TYPE_KEYWORDS[parts[0].toUpperCase()];
    if (!keyword) {
      return failParse(
        line,
        "group",
        `Loại nhóm "${parts[0]}" không hợp lệ — dùng AUDIO | PASSAGE | IMAGE | CUSTOM.`,
      );
    }
    const title = parts.slice(1).join(" | ").trim();
    return {
      line,
      kind: "group",
      ok: true,
      groupType: keyword,
      groupTitle: title || undefined,
    };
  }

  if (cmd === "direct") return { line, kind: "direct", ok: true };

  const materialType = MATERIAL_CMDS[cmd];
  if (materialType) {
    if (!restStr) return failParse(line, "material", `Thiếu nội dung sau #${cmd}.`);
    const parts = restStr.split("|").map((p) => p.trim());
    const value = parts[0];
    const title = parts.slice(1).join(" | ").trim() || undefined;
    if (!value) return failParse(line, "material", `Thiếu nội dung sau #${cmd}.`);
    if (materialType === ExamMaterialType.AUDIO || materialType === ExamMaterialType.IMAGE) {
      if (!/^(https?:\/\/|\/)/i.test(value)) {
        return failParse(
          line,
          "material",
          `#${cmd} cần URL (bắt đầu bằng http:// hoặc /) — nhận "${value.slice(0, 40)}".`,
        );
      }
      return {
        line,
        kind: "material",
        ok: true,
        material: { type: materialType, title, fileUrl: value },
      };
    }
    return {
      line,
      kind: "material",
      ok: true,
      material: { type: materialType, title, content: value },
    };
  }

  return null; // không phải lệnh → dòng chú thích, bỏ qua.
}

/**
 * Parse nội dung dán: mỗi dòng 1 câu (trắc nghiệm / điền chỗ / đúng-sai /
 * nối / tự luận / thu âm) hoặc lệnh #group/#direct/#audio… — kiểm lỗi từng dòng.
 */
function parseBulkText(text: string): ParsedLine[] {
  const out: ParsedLine[] = [];
  text.replace(/\r/g, "").split("\n").forEach((raw, index) => {
    const line = index + 1;
    const trimmed = raw.trim();
    if (trimmed === "") return;

    if (trimmed.startsWith("#")) {
      const directive = parseDirective(trimmed, line);
      if (directive) out.push(directive);
      return;
    }

    const all = trimmed.split("|").map((field) => field.trim());
    let type: QuestionType | null = null;
    let explicit = false;
    if (all.length >= 2) {
      const tag = TYPE_TAGS[all[0].toUpperCase().replace(/[\s-]+/g, "_")];
      if (tag) {
        type = tag;
        explicit = true;
        all.shift();
      }
    }
    if (!type) {
      if (all.length === 6) {
        type = QuestionType.MULTIPLE_CHOICE; // loại thật suy tiếp từ chữ cái đáp án
      } else if (all.length === 2) {
        type = QuestionType.FILL_BLANK;
      } else {
        out.push(
          failParse(
            line,
            "question",
            `Sai định dạng: dùng 6 trường (câu hỏi | A | B | C | D | đáp án), 2 trường ` +
              `(câu hỏi | đáp án) hoặc tiền tố loại câu hỏi (TF|…, FB|…, SA|…, MT|…) — ` +
              `nhận ${all.length} trường.`,
          ),
        );
        return;
      }
    }
    out.push(buildQuestion(all, type, explicit, line));
  });
  return out;
}

/**
 * Dán nhanh nhiều câu hỏi 1 lần (không cần file Excel): mỗi dòng 1 câu,
 * parse + kiểm lỗi ngay khi dán. Hỗ trợ mọi loại câu hỏi (tiền tố TF/FB/SA/
 * MT/ES/AR) và lệnh #group để tạo nhóm mới + #audio/#passage… thêm tài liệu
 * ngay trong lúc dán — thêm lần lượt vào phần thi, nhóm có sẵn hoặc nhóm mới.
 */
export function BulkPasteQuestionsDialog({
  open,
  onOpenChange,
  section,
  groups,
  directCount,
}: BulkPasteQuestionsDialogProps) {
  const [target, setTarget] = useState(DIRECT_TARGET);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  const createInSection = useCreateExamQuestionInSection();
  const createInGroup = useCreateExamQuestion();
  const createGroup = useCreateExamQuestionGroup();
  const createMaterial = useCreateExamGroupMaterial();

  const groupId = target === DIRECT_TARGET ? 0 : Number(target);
  const { data: groupQuestions } = useExamQuestions(groupId);
  const { data: groupMaterials } = useExamGroupMaterials(groupId);

  const parsed = useMemo(() => parseBulkText(text), [text]);

  // Ghép parse + mục tiêu: lệnh #group/#direct đổi mục tiêu giữa chừng;
  // tài liệu phải nằm trong nhóm (nhóm có sẵn hoặc vừa tạo).
  const plan: PastePlan = useMemo(() => {
    const newGroups: PlanGroup[] = [];
    const works: PlanWork[] = [];
    const targetErrors: ParsedLine[] = [];
    let current: Target =
      target === DIRECT_TARGET ? { kind: "direct" } : { kind: "group", id: Number(target) };

    for (const item of parsed) {
      if (!item.ok) continue;
      if (item.kind === "group") {
        newGroups.push({
          line: item.line,
          groupType: item.groupType ?? ExamGroupType.CUSTOM,
          title: item.groupTitle,
        });
        current = { kind: "new", idx: newGroups.length - 1 };
        continue;
      }
      if (item.kind === "direct") {
        current = { kind: "direct" };
        continue;
      }
      if (item.kind === "material" && current.kind === "direct") {
        targetErrors.push({
          ...item,
          ok: false,
          error: 'Tài liệu cần nhóm — đặt sau dòng #group hoặc chọn nhóm ở ô "Thêm vào".',
        });
        continue;
      }
      works.push({ item, target: current });
    }

    const questions = works.filter((w) => w.item.kind === "question");
    const materials = works.filter((w) => w.item.kind === "material");
    const errors = [...parsed.filter((e) => !e.ok), ...targetErrors].sort(
      (a, b) => a.line - b.line,
    );
    return { errors, newGroups, works, questions, materials, total: newGroups.length + works.length };
  }, [parsed, target]);

  const reset = () => {
    setText("");
    setTarget(DIRECT_TARGET);
    setProgress({ done: 0, total: 0 });
  };

  const groupLabel = (group: AdminExamQuestionGroup) =>
    group.title ||
    (group.groupType ? QUESTION_GROUP_TYPE_LABELS[group.groupType] : undefined) ||
    `Nhóm #${group.position}`;

  // items → Select.Value hiển thị label thay vì raw value ("direct"/id nhóm).
  const targetItems: Record<string, string> = {
    [DIRECT_TARGET]: `Câu trực lập — ${section.name} (${directCount} hiện có)`,
  };
  for (const group of groups) targetItems[String(group.id)] = groupLabel(group);

  const primaryLabel =
    plan.questions.length > 0
      ? `Thêm ${plan.questions.length} câu`
      : plan.newGroups.length > 0
        ? `Tạo ${plan.newGroups.length} nhóm`
        : `Thêm ${plan.materials.length} tài liệu`;

  const handleSubmit = async () => {
    if (plan.total === 0) {
      toast.error("Chưa có nội dung hợp lệ nào để thêm.");
      return;
    }
    setSubmitting(true);
    setProgress({ done: 0, total: plan.total });
    const failedQuestions: number[] = [];
    const failedOthers: number[] = [];
    let groupsMade = 0;
    let materialsMade = 0;
    let done = 0;
    try {
      // 1) Tạo các nhóm mới theo thứ tự xuất hiện → id ánh xạ cho mục tiêu "new".
      const newIds: (number | null)[] = [];
      for (let i = 0; i < plan.newGroups.length; i++) {
        const group = plan.newGroups[i];
        try {
          const created = await createGroup.mutateAsync({
            sectionId: section.id,
            data: {
              groupType: group.groupType,
              title: group.title,
              position: groups.length + i + 1,
            },
          });
          newIds.push(created.id);
          groupsMade += 1;
        } catch {
          newIds.push(null);
          failedOthers.push(group.line);
        }
        done += 1;
        setProgress({ done, total: plan.total });
      }
      const resolveGroup = (t: Target): number | null =>
        t.kind === "group" ? t.id : t.kind === "new" ? newIds[t.idx] : null;

      // 2) Câu hỏi + tài liệu theo đúng thứ tự dòng, position theo từng mục tiêu.
      const questionCounters = new Map<string, number>();
      const materialCounters = new Map<string, number>();
      for (const work of plan.works) {
        try {
          if (work.item.kind === "material") {
            const gid = resolveGroup(work.target);
            if (gid == null) throw new Error("no-group");
            const key = String(gid);
            const next = (materialCounters.get(key) ?? 0) + 1;
            materialCounters.set(key, next);
            const base = work.target.kind === "group" ? groupMaterials?.length ?? 0 : 0;
            await createMaterial.mutateAsync({
              groupId: gid,
              data: { ...work.item.material!, position: base + next },
            });
            materialsMade += 1;
          } else {
            const direct = work.target.kind === "direct";
            let key: string;
            let base: number;
            if (direct) {
              key = "direct";
              base = directCount;
            } else {
              const gid = resolveGroup(work.target);
              if (gid == null) throw new Error("no-group");
              key = `g${gid}`;
              base = work.target.kind === "group" ? groupQuestions?.length ?? 0 : 0;
            }
            const next = (questionCounters.get(key) ?? 0) + 1;
            questionCounters.set(key, next);
            const dto: CreateExamQuestionDto = {
              ...work.item.dto!,
              position: base + next,
            };
            if (direct) {
              await createInSection.mutateAsync({ sectionId: section.id, data: dto });
            } else {
              await createInGroup.mutateAsync({ groupId: Number(key.slice(1)), data: dto });
            }
          }
        } catch {
          if (work.item.kind === "question") failedQuestions.push(work.item.line);
          else failedOthers.push(work.item.line);
        }
        done += 1;
        setProgress({ done, total: plan.total });
      }
    } finally {
      setSubmitting(false);
    }

    const added = plan.questions.length - failedQuestions.length;
    const failedLines = [...failedOthers, ...failedQuestions].sort((a, b) => a - b);
    const extras: string[] = [];
    if (groupsMade > 0) extras.push(`${groupsMade} nhóm`);
    if (materialsMade > 0) extras.push(`${materialsMade} tài liệu`);
    const extraText = extras.length > 0 ? ` + ${extras.join(" + ")}` : "";

    if (failedLines.length === 0) {
      toast.success(`Đã thêm ${added} câu hỏi vào "${section.name}"${extraText}.`);
    } else if (added === 0 && groupsMade === 0 && materialsMade === 0) {
      toast.error(`Thêm thất bại cả ${failedLines.length} mục (dòng ${failedLines.join(", ")}).`);
    } else {
      toast.warning(`Đã thêm ${added} câu${extraText} — lỗi ở dòng ${failedLines.join(", ")}.`);
    }
    if (added > 0 || groupsMade > 0 || materialsMade > 0) {
      onOpenChange(false);
      reset();
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v && !submitting) reset();
      }}
    >
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-1.5">
            <ClipboardPaste className="size-4 text-primary" />
            Dán nhanh nhiều câu hỏi
          </DialogTitle>
          <DialogDescription>
            Mỗi dòng 1 câu, phân tách bằng <code className="rounded bg-muted px-1">|</code>. Dùng
            lệnh <code className="rounded bg-muted px-1">#group</code> /{" "}
            <code className="rounded bg-muted px-1">#direct</code> để đổi chỗ thêm giữa chừng — cú
            pháp đầy đủ ở cột phải.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Thêm vào (mục tiêu ban đầu)</Label>
              <Select
                items={targetItems}
                value={target}
                onValueChange={(v) => setTarget(v ?? DIRECT_TARGET)}
                disabled={submitting}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={DIRECT_TARGET}>
                    Câu trực lập — {section.name} ({directCount} hiện có)
                  </SelectItem>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={String(group.id)}>
                      {groupLabel(group)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Nội dung dán</Label>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={16}
                spellCheck={false}
                disabled={submitting}
                placeholder={
                  "#group AUDIO | Đoạn hội thoại 1\n" +
                  "What does the woman suggest doing? | She will call back later | She agrees with the man | She has no information | She needs more time | A\n" +
                  "#direct\n" +
                  "The new policy will ___ next month. | take effect"
                }
                className="font-mono text-xs"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Badge
                variant="outline"
                className="border-emerald-200 bg-emerald-50 text-emerald-700"
              >
                <CheckCircle2 className="size-3" />
                {plan.questions.length} câu hợp lệ
              </Badge>
              {plan.newGroups.length > 0 && (
                <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-600">
                  <FolderPlus className="size-3" />
                  {plan.newGroups.length} nhóm mới
                </Badge>
              )}
              {plan.materials.length > 0 && (
                <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                  <FileText className="size-3" />
                  {plan.materials.length} tài liệu
                </Badge>
              )}
              {plan.errors.length > 0 && (
                <Badge variant="outline" className="border-red-200 bg-red-50 text-red-600">
                  <AlertTriangle className="size-3" />
                  {plan.errors.length} dòng lỗi
                </Badge>
              )}
              {plan.errors.length > 0 && (
                <ul className="max-h-32 w-full space-y-1 overflow-y-auto text-xs text-red-600">
                  {plan.errors.slice(0, 20).map((entry) => (
                    <li key={entry.line}>
                      Dòng {entry.line}: {entry.error}
                    </li>
                  ))}
                  {plan.errors.length > 20 && <li>…và {plan.errors.length - 20} lỗi khác.</li>}
                </ul>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Cú pháp nhanh</Label>
              <pre className="max-h-56 overflow-y-auto rounded-lg border bg-muted/40 p-3 font-mono text-[11px] leading-relaxed whitespace-pre-wrap">
                {SYNTAX_HELP}
              </pre>
            </div>

            <div className="space-y-2">
              <Label>Câu hợp lệ (xem trước)</Label>
              <ul className="max-h-40 space-y-1 overflow-y-auto text-xs text-muted-foreground">
                {plan.questions.slice(0, 8).map((work) => (
                  <li key={work.item.line} className="truncate">
                    Dòng {work.item.line}: {work.item.dto!.question.slice(0, 80)} —{" "}
                    {QUESTION_TYPE_LABELS[work.item.dto!.type]}
                  </li>
                ))}
                {plan.questions.length > 8 && (
                  <li>…và {plan.questions.length - 8} câu nữa.</li>
                )}
                {plan.questions.length === 0 && <li>Chưa có câu hợp lệ nào.</li>}
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Hủy
          </Button>
          <Button onClick={() => void handleSubmit()} disabled={submitting || plan.total === 0}>
            <ClipboardPaste className="mr-1.5 size-4" />
            {submitting
              ? `Đang thêm ${progress.done}/${progress.total}…`
              : primaryLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
