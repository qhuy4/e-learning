import { Injectable } from '@nestjs/common';
import { ExamGroupType } from '../../domain/enums/exam-group-type.enum';
import { ExamMaterialType } from '../../domain/enums/exam-material-type.enum';
import { QuestionType } from '../../domain/enums/question-type.enum';
import type {
  ExamImportContext,
  ImportIssue,
  ImportRow,
  NormalizedExamImport,
  NormalizedGroup,
  NormalizedMaterial,
  NormalizedOption,
  NormalizedQuestion,
} from '../exam-import.model';
import {
  ExamTypeMapperRegistry,
  type ExamTypeMapperRuleContext,
} from '../mapper/exam-type.mapper';

const LETTERS = ['A', 'B', 'C', 'D'] as const;
const UNKNOWN_SECTION = '(không rõ section)';

const QUESTION_TYPE_ALIAS: Record<string, QuestionType> = {
  MULTIPLE_CHOICE: QuestionType.MULTIPLE_CHOICE,
  MC: QuestionType.MULTIPLE_CHOICE,
  MULTIPLE: QuestionType.MULTIPLE_CHOICE,
  CHOICE: QuestionType.MULTIPLE_CHOICE,
  SINGLE_CHOICE: QuestionType.MULTIPLE_CHOICE,
  TRAC_NHIEM: QuestionType.MULTIPLE_CHOICE,
  MULTI_SELECT: QuestionType.MULTI_SELECT,
  MULTISELECT: QuestionType.MULTI_SELECT,
  MULTI: QuestionType.MULTI_SELECT,
  SELECT_MANY: QuestionType.MULTI_SELECT,
  TRUE_FALSE: QuestionType.TRUE_FALSE,
  TRUEFALSE: QuestionType.TRUE_FALSE,
  TF: QuestionType.TRUE_FALSE,
  DUNG_SAI: QuestionType.TRUE_FALSE,
  FILL_BLANK: QuestionType.FILL_BLANK,
  FILLINTHEBLANK: QuestionType.FILL_BLANK,
  FILL: QuestionType.FILL_BLANK,
  BLANK: QuestionType.FILL_BLANK,
  DONG_DU: QuestionType.FILL_BLANK,
  MATCHING: QuestionType.MATCHING,
  MATCH: QuestionType.MATCHING,
  SHORT_ANSWER: QuestionType.SHORT_ANSWER,
  SHORTANSWER: QuestionType.SHORT_ANSWER,
  SHORT: QuestionType.SHORT_ANSWER,
  ESSAY: QuestionType.ESSAY,
  TU_LUAN: QuestionType.ESSAY,
  AUDIO_RECORD: QuestionType.AUDIO_RECORD,
  AUDIORECORD: QuestionType.AUDIO_RECORD,
  RECORD: QuestionType.AUDIO_RECORD,
  AUDIO_ANSWER: QuestionType.AUDIO_RECORD,
};

const GROUP_TYPE_ALIAS: Record<string, string> = {
  AUDIO: ExamGroupType.AUDIO,
  LISTEN: ExamGroupType.AUDIO,
  LISTENING: ExamGroupType.AUDIO,
  CONVERSATION: ExamGroupType.AUDIO,
  TALK: ExamGroupType.AUDIO,
  PASSAGE: ExamGroupType.PASSAGE,
  READING: ExamGroupType.PASSAGE,
  TEXT: ExamGroupType.PASSAGE,
  ARTICLE: ExamGroupType.PASSAGE,
  IMAGE: ExamGroupType.IMAGE,
  PIC: ExamGroupType.IMAGE,
  PHOTO: ExamGroupType.IMAGE,
  PHOTOGRAPH: ExamGroupType.IMAGE,
  PICTURE: ExamGroupType.IMAGE,
  DIAGRAM: ExamGroupType.IMAGE,
  CUSTOM: ExamGroupType.CUSTOM,
  OTHER: ExamGroupType.CUSTOM,
};

const MATERIAL_TYPE_ALIAS: Record<string, string> = {
  AUDIO: ExamMaterialType.AUDIO,
  SOUND: ExamMaterialType.AUDIO,
  LISTENING: ExamMaterialType.AUDIO,
  PASSAGE: ExamMaterialType.PASSAGE,
  READING: ExamMaterialType.PASSAGE,
  TEXT: ExamMaterialType.TEXT,
  TRANSCRIPT: ExamMaterialType.TEXT,
  NOTE: ExamMaterialType.TEXT,
  IMAGE: ExamMaterialType.IMAGE,
  PIC: ExamMaterialType.IMAGE,
  PHOTO: ExamMaterialType.IMAGE,
  PICTURE: ExamMaterialType.IMAGE,
  DIAGRAM: ExamMaterialType.IMAGE,
};

interface SectionDraft {
  name: string;
  currentGroup: string | null;
  direct: NormalizedQuestion[];
  groups: Map<string, GroupDraft>;
  sourceRow: number | null;
}

interface GroupDraft {
  name: string;
  groupTypeRaw: string | null;
  materials: MaterialDraft[];
  questions: NormalizedQuestion[];
  sourceRow: number | null;
}

interface MaterialDraft {
  typeRaw: string | null;
  title: string | null;
  content: string | null;
  fileUrl: string | null;
  sourceRow: number | null;
}

/** Uppercase + strip accents + fold to A-Z0-9_ ("Đúng/Sai" -> "DUNG_SAI"). */
function foldKey(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/[đĐ]/g, 'D')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function answerLetters(raw: string): { letters: string; outOfRange: boolean } {
  const alpha = foldKey(raw).replace(/[^A-Z]/g, '');
  let letters = '';
  let outOfRange = false;
  for (const ch of alpha) {
    if ((LETTERS as readonly string[]).includes(ch)) letters += ch;
    else outOfRange = true;
  }
  return { letters, outOfRange };
}

function trueFalseToken(raw: string): 'A' | 'B' | '' {
  const token = foldKey(raw).replace(/_/g, '');
  if (['A', 'TRUE', 'T', 'YES', '1', 'DUNG'].includes(token)) return 'A';
  if (['B', 'FALSE', 'F', 'NO', '0', 'SAI'].includes(token)) return 'B';
  return '';
}

function parsePosition(raw: string | undefined): number | null {
  if (!raw) return null;
  const n = Number.parseInt(String(raw).trim(), 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function parsePoints(raw: string | undefined): number {
  if (!raw) return 1;
  const n = Number.parseFloat(String(raw).trim());
  return Number.isFinite(n) && n > 0 ? n : 1;
}

function looksLikeUrl(value: string): boolean {
  return (
    /^https?:\/\//i.test(value) ||
    value.startsWith('data:') ||
    // Placeholder for a file inside the uploaded ZIP package — resolved to a
    // real storage URL on confirm (package import), never saved as-is.
    value.startsWith('package://')
  );
}

/** Media filename inside a ZIP package ("Part-2/audio/g1.mp3" -> "g1.mp3"). */
function mediaTitle(mediaRef: string): string {
  const clean = mediaRef.replace(/\\/g, '/').split('/').pop() ?? mediaRef;
  return clean.trim() || mediaRef;
}

/** Meta keys produced by parsers (e.g. `__excelRow`) — never content. */
function isMetaKey(key: string): boolean {
  return key.startsWith('__');
}

/**
 * Column-driven normalizer: rows -> Exam / Sections / Direct questions / Groups
 * (materials + questions), applying exam-type mapping rules for anything the
 * file leaves out. See exam-type.mapper.ts for the extension points.
 */
@Injectable()
export class ExamImportNormalizer {
  constructor(private readonly mapperRegistry: ExamTypeMapperRegistry) {}

  normalize(
    rows: ImportRow[],
    ctx: ExamImportContext,
  ): { data: NormalizedExamImport; warnings: ImportIssue[] } {
    const warnings: ImportIssue[] = [];
    const warn = (
      code: string,
      message: string,
      path = '',
      excelRow?: number | null,
    ) =>
      warnings.push({
        severity: 'warning',
        code,
        path,
        message,
        excelRow: excelRow ?? null,
      });

    const mapper = this.mapperRegistry.resolve(ctx.examTypeName);
    const sectionMap = new Map<string, SectionDraft>();
    const implicitGroupNoticed = new Set<string>();
    /** Media refs already attached per group — prevents duplicate materials. */
    const groupMediaSeen = new Map<GroupDraft, Set<string>>();
    let emptySectionRows = 0;

    const ruleCtx = (
      sectionName: string,
      groupExists: boolean,
      templateGroupType: string | null,
      templateQuestionType: string | null,
    ): ExamTypeMapperRuleContext => ({
      ...ctx,
      sectionName,
      groupExists,
      templateGroupType,
      templateQuestionType,
    });

    const getGroup = (
      section: SectionDraft,
      name: string,
      rowTypeRaw: string,
      sourceRow: number | null,
    ): GroupDraft => {
      let g = section.groups.get(name);
      if (!g) {
        g = {
          name,
          groupTypeRaw: null,
          materials: [],
          questions: [],
          sourceRow,
        };
        section.groups.set(name, g);
      }
      if (rowTypeRaw) {
        if (!g.groupTypeRaw) {
          g.groupTypeRaw = rowTypeRaw;
        } else if (foldKey(g.groupTypeRaw) !== foldKey(rowTypeRaw)) {
          warn(
            'GROUP_TYPE_CONFLICT',
            `Group "${name}" có nhiều group_type ("${g.groupTypeRaw}", "${rowTypeRaw}") — dùng "${g.groupTypeRaw}".`,
          );
        }
      }
      return g;
    };

    rows.forEach((row, index) => {
      const sourceRow = row.__excelRow ?? null;
      // Scaffold rows from the exam-scoped template (only the section name is
      // pre-filled) carry no content yet — skip them without noise.
      const hasContent = Object.entries(row).some(
        ([key, value]) =>
          key !== 'section' &&
          !isMetaKey(key) &&
          String(value ?? '').trim() !== '',
      );
      if (!hasContent) return;

      let sectionName = (row.section ?? '').trim();
      if (!sectionName) {
        emptySectionRows += 1;
        sectionName = UNKNOWN_SECTION;
      }
      let section = sectionMap.get(sectionName);
      if (!section) {
        section = {
          name: sectionName,
          currentGroup: null,
          direct: [],
          groups: new Map(),
          sourceRow,
        };
        sectionMap.set(sectionName, section);
      }

      // Group association with fill-down; "-" or "direct" forces a direct question.
      const groupRaw = (row.group ?? '').trim();
      if (groupRaw) {
        if (/^(?:[-–—]|direct)$/i.test(groupRaw)) section.currentGroup = null;
        else section.currentGroup = groupRaw;
      }

      const questionText = (row.question ?? '').trim();
      const mediaRaw = (row.media ?? '').trim();
      const hasMaterialFields =
        !!(row.materialType ?? '').trim() ||
        !!(row.materialTitle ?? '').trim() ||
        !!(row.materialContent ?? '').trim() ||
        mediaRaw.length > 0;

      // ---------------- material row ----------------
      if (!questionText && hasMaterialFields) {
        if (!section.currentGroup) {
          section.currentGroup = 'Group 1';
          const key = `${sectionName}::Group 1`;
          if (!implicitGroupNoticed.has(key)) {
            implicitGroupNoticed.add(key);
            warn(
              'MATERIAL_IMPLICIT_GROUP',
              `Dòng tài liệu không có cột "group" — được gán vào group tự tạo "Group 1" của "${sectionName}".`,
              '',
              sourceRow,
            );
          }
        }
        const group = getGroup(
          section,
          section.currentGroup,
          (row.groupType ?? '').trim(),
          sourceRow,
        );
        const draft = buildMaterialDraft(row);
        const mediaKey = draft.fileUrl?.startsWith('package://')
          ? draft.fileUrl.slice('package://'.length).toLowerCase()
          : null;
        const seen = groupMediaSeen.get(group) ?? new Set<string>();
        groupMediaSeen.set(group, seen);
        if (mediaKey && seen.has(mediaKey) && !draft.content) {
          // Same package file already attached to this group (e.g. referenced
          // by an earlier row) — keep a single material.
        } else {
          if (mediaKey) seen.add(mediaKey);
          group.materials.push(draft);
        }
        return;
      }

      // ---------------- empty / unusable row ----------------
      if (!questionText) {
        const hasAnyValue = Object.entries(row).some(
          ([key, v]) => !isMetaKey(key) && String(v ?? '').trim() !== '',
        );
        if (hasAnyValue) {
          warn(
            'ROW_IGNORED',
            `Dòng ${sourceRow ?? index + 1} không có "question" hay tài liệu hợp lệ — bị bỏ qua.`,
            '',
            sourceRow,
          );
        }
        return;
      }

      // ---------------- question row ----------------
      const typeRaw = (row.questionType ?? '').trim();
      let questionType: QuestionType;
      if (typeRaw) {
        const canonical = foldKey(typeRaw);
        questionType =
          QUESTION_TYPE_ALIAS[canonical] ?? (canonical as QuestionType);
      } else {
        questionType =
          mapper?.inferQuestionType(
            ruleCtx(sectionName, !!section.currentGroup, null, null),
          ) ?? QuestionType.MULTIPLE_CHOICE;
      }

      const options = this.buildOptions(row, questionType, (msg, code) =>
        warn(code, msg, '', sourceRow),
      );

      const question: NormalizedQuestion = {
        type: questionType,
        question: questionText,
        explanation: (row.explanation ?? '').trim() || null,
        points: parsePoints(row.points),
        position: 0,
        options,
        sourceRow,
        questionNumber: (row.questionNumber ?? '').trim() || null,
      };

      if (section.currentGroup) {
        const group = getGroup(
          section,
          section.currentGroup,
          (row.groupType ?? '').trim(),
          sourceRow,
        );
        question.position =
          parsePosition(row.position) ?? group.questions.length + 1;
        group.questions.push(question);

        // Media on the question row (e.g. one photo/audio shared by the group's
        // questions) becomes a material of that group — deduplicated so N
        // questions referencing the same file yield a single material.
        if (mediaRaw) {
          const seen = groupMediaSeen.get(group) ?? new Set<string>();
          groupMediaSeen.set(group, seen);
          const mediaKey = mediaRaw.toLowerCase();
          if (!seen.has(mediaKey)) {
            seen.add(mediaKey);
            group.materials.push({
              typeRaw: null,
              title: mediaTitle(mediaRaw),
              content: null,
              fileUrl: looksLikeUrl(mediaRaw)
                ? mediaRaw
                : `package://${mediaRaw}`,
              sourceRow,
            });
          }
        }
      } else {
        question.position =
          parsePosition(row.position) ?? section.direct.length + 1;
        section.direct.push(question);
        if (mediaRaw) {
          // Sections without groups cannot hold materials — see package validator
          // (escalated to an error so the package never imports silently broken).
          warn(
            'MEDIA_ON_DIRECT',
            `Dòng ${sourceRow ?? '?'}: câu hỏi trực tiếp có media "${mediaRaw}" — phần thi này không có group nên không gắn được media; hãy điền cột "group" cho câu hỏi hoặc thêm dòng tài liệu riêng.`,
            '',
            sourceRow,
          );
        }
      }
    });

    if (emptySectionRows > 0) {
      warn(
        'SECTION_MISSING_ROWS',
        `${emptySectionRows} dòng thiếu cột "section" — được gán vào "${UNKNOWN_SECTION}".`,
      );
    }

    // -------- pass 2: resolve group/material types (may come from later rows) --------
    const data: NormalizedExamImport = { sections: [] };
    sectionMap.forEach((section) => {
      const groups: NormalizedGroup[] = [];
      let groupIndex = 0;
      section.groups.forEach((draft) => {
        groupIndex += 1;
        const rc = ruleCtx(section.name, true, draft.groupTypeRaw, null);
        let groupType: string;
        if (draft.groupTypeRaw) {
          const canonical = foldKey(draft.groupTypeRaw);
          groupType = GROUP_TYPE_ALIAS[canonical] ?? canonical;
        } else {
          const inferred = mapper?.inferGroupType(rc) ?? null;
          groupType = inferred ?? ExamGroupType.CUSTOM;
          if (!inferred) {
            warn(
              'GROUP_TYPE_DEFAULT',
              `Group "${draft.name}" không có group_type — mặc định CUSTOM.`,
              '',
              draft.sourceRow,
            );
          }
        }

        const materials: NormalizedMaterial[] = draft.materials.map((m, mi) => {
          let materialType: string;
          if (m.typeRaw) {
            const canonical = foldKey(m.typeRaw);
            materialType = MATERIAL_TYPE_ALIAS[canonical] ?? canonical;
          } else if (groupType === ExamGroupType.AUDIO) {
            materialType = ExamMaterialType.AUDIO;
          } else if (groupType === ExamGroupType.PASSAGE) {
            materialType = ExamMaterialType.PASSAGE;
          } else if (groupType === ExamGroupType.IMAGE) {
            materialType = ExamMaterialType.IMAGE;
          } else {
            materialType = ExamMaterialType.TEXT;
            warn(
              'MATERIAL_TYPE_DEFAULT',
              `Tài liệu "${m.title ?? `#${mi + 1}`}" của group "${draft.name}" không có material_type — mặc định TEXT.`,
            );
          }
          return {
            type: materialType as NormalizedMaterial['type'],
            title: m.title,
            content: m.content,
            fileUrl: m.fileUrl,
            transcript: null,
            position: mi + 1,
            sourceRow: m.sourceRow,
          };
        });

        groups.push({
          name: draft.name,
          groupType: groupType as NormalizedGroup['groupType'],
          materials,
          questions: draft.questions,
          position: groupIndex,
          sourceRow: draft.sourceRow,
        });
      });

      data.sections.push({
        name: section.name,
        directQuestions: section.direct,
        groups,
        sourceRow: section.sourceRow,
      });
    });

    return { data, warnings };
  }

  private buildOptions(
    row: ImportRow,
    questionType: QuestionType,
    warn: (message: string, code: string) => void,
  ): NormalizedOption[] {
    const correctRaw = (row.correctAnswer ?? '').trim();
    const { letters, outOfRange } = answerLetters(correctRaw);
    if (outOfRange) {
      warn(
        `Câu "${(row.question ?? '').slice(0, 40)}..." có correct_answer ngoài A–D — phần thừa bị bỏ qua.`,
        'ANSWER_RANGE',
      );
    }

    if (questionType === QuestionType.TRUE_FALSE) {
      const token = trueFalseToken(correctRaw);
      const optionA = (row.optionA ?? '').trim();
      const optionB = (row.optionB ?? '').trim();
      return [
        { content: optionA || 'True', isCorrect: token === 'A', position: 1 },
        { content: optionB || 'False', isCorrect: token === 'B', position: 2 },
      ];
    }

    if (
      questionType === QuestionType.FILL_BLANK ||
      questionType === QuestionType.SHORT_ANSWER
    ) {
      const answer = correctRaw || (row.optionA ?? '').trim();
      return answer ? [{ content: answer, isCorrect: true, position: 1 }] : [];
    }

    if (
      questionType === QuestionType.ESSAY ||
      questionType === QuestionType.AUDIO_RECORD
    ) {
      const hasChoiceData =
        correctRaw !== '' ||
        [row.optionA, row.optionB, row.optionC, row.optionD].some(
          (o) => (o ?? '').trim() !== '',
        );
      if (hasChoiceData) {
        warn(
          `Câu dạng ${questionType} không dùng đáp án trắc nghiệm — cột answer/option bị bỏ qua.`,
          'ESSAY_ANSWER_IGNORED',
        );
      }
      return [];
    }

    // MULTIPLE_CHOICE / MULTI_SELECT / MATCHING / unknown types
    const columns = [row.optionA, row.optionB, row.optionC, row.optionD].map(
      (o) => (o ?? '').trim(),
    );
    return columns
      .map((content, i) => ({
        content,
        isCorrect: letters.includes(LETTERS[i]),
        position: i + 1,
      }))
      .filter((o) => o.content !== '');
  }
}

function buildMaterialDraft(row: ImportRow): MaterialDraft {
  const typeRaw = (row.materialType ?? '').trim() || null;
  const title = (row.materialTitle ?? '').trim() || null;
  const raw = (row.materialContent ?? '').trim();
  const sourceRow = row.__excelRow ?? null;
  const media = (row.media ?? '').trim();
  if (media) {
    // "Media filename" column: file inside the ZIP package (package:// is
    // resolved to a real storage URL at confirm time) or a direct URL.
    const fileUrl = looksLikeUrl(media) ? media : `package://${media}`;
    return {
      typeRaw,
      title: title ?? mediaTitle(media),
      content: raw && !looksLikeUrl(raw) ? raw : null,
      fileUrl,
      sourceRow,
    };
  }
  if (raw && looksLikeUrl(raw)) {
    return { typeRaw, title, content: null, fileUrl: raw, sourceRow };
  }
  return { typeRaw, title, content: raw || null, fileUrl: null, sourceRow };
}
