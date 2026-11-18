import * as XLSX from 'xlsx';

/** Standard Excel template columns for the Exam Import feature. */
export const IMPORT_TEMPLATE_COLUMNS = [
  'section',
  'group',
  'group_type',
  'material_type',
  'material_title',
  'material_content',
  'question',
  'question_type',
  'option_a',
  'option_b',
  'option_c',
  'option_d',
  'correct_answer',
  'explanation',
  'position',
] as const;

const GUIDE_ROWS: (string | number)[][] = [
  ['HƯỚNG DẪN IMPORT ĐỀ THI', ''],
  ['Cột', 'Ý nghĩa / Quy ước'],
  [
    'section',
    'Tên phần thi — phải TRÙNG tên phần thi của đề thi (vd: Part 3, Reading, Section 1). Ô trống sẽ lấy giá trị dòng phía trên.',
  ],
  [
    'group',
    'Tên nhóm câu hỏi (vd: Group 1). Ô trống = lấy group gần nhất phía trên; ghi "-" hoặc "direct" = câu hỏi trực tiếp.',
  ],
  [
    'group_type',
    'AUDIO | PASSAGE | IMAGE | CUSTOM. Bỏ trống để hệ thống tự suy luận theo loại đề (TOEIC/IELTS...).',
  ],
  [
    'material_type',
    'AUDIO | PASSAGE | IMAGE | TEXT — dùng cho dòng CHỈ có tài liệu (không có question).',
  ],
  ['material_title', 'Tiêu đề tài liệu.'],
  ['material_content', 'Nội dung (passage/văn bản) HOẶC URL file (audio/ảnh).'],
  ['question', 'Nội dung câu hỏi (bắt buộc với dòng câu hỏi).'],
  [
    'question_type',
    'MULTIPLE_CHOICE | MULTI_SELECT | TRUE_FALSE | FILL_BLANK | MATCHING | SHORT_ANSWER | ESSAY | AUDIO_RECORD (mặc định MULTIPLE_CHOICE).',
  ],
  ['option_a .. option_d', '4 phương án trả lời.'],
  [
    'correct_answer',
    'Đáp án: chữ cái A–D (nhiều đáp án ghi: AC), TRUE/FALSE với TRUE_FALSE, hoặc nội dung đáp án với FILL_BLANK/SHORT_ANSWER.',
  ],
  ['explanation', 'Lời giải (tùy chọn).'],
  ['position', 'Thứ tự câu hỏi (tùy chọn — để trống sẽ xếp theo thứ tự dòng).'],
  ['', ''],
  [
    'VÍ DỤ — sheet Import đã có sẵn 6 dòng dữ liệu mẫu TOEIC (Part 3 có group + Part 5 câu trực tiếp): hãy thay bằng dữ liệu thật của bạn, hoặc xóa hết rồi nhập mới.',
    '',
  ],
];

const EXAMPLE_ROWS: (string | number)[][] = [
  [...IMPORT_TEMPLATE_COLUMNS],
  [
    'Part 3',
    'Group 1',
    'AUDIO',
    'AUDIO',
    'Bài nghe Part 3 – Questions 1-3',
    'https://example.com/audio/part3-1.mp3',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
  ],
  [
    'Part 3',
    '',
    '',
    '',
    '',
    '',
    'What does the woman suggest doing?',
    'MULTIPLE_CHOICE',
    'She will call back later',
    'She agrees with the man',
    'She has no information',
    'She needs more time',
    'B',
    'Group để trống: tự nối với group phía trên',
    '1',
  ],
  [
    'Part 5',
    '-',
    '',
    '',
    '',
    '',
    'The new policy will ___ next month.',
    'MULTIPLE_CHOICE',
    'take effect',
    'take effects',
    'taking effect',
    'took effect',
    'A',
    'Ghi "-" = câu hỏi trực tiếp (không group)',
    '1',
  ],
];

/** Ready-to-edit TOEIC sample rows shipped inside the "Import" sheet. */
const SAMPLE_ROWS: (string | number)[][] = [
  [
    'Part 3',
    'Group 1',
    'AUDIO',
    'AUDIO',
    '[VÍ DỤ] Part 3 – Woman needs the sales report',
    'https://example.com/audio/toeic-part3.mp3',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
  ],
  [
    'Part 3',
    '',
    '',
    '',
    '',
    '',
    'What does the woman want the man to do?',
    'MULTIPLE_CHOICE',
    'Finish the sales report',
    'Call the client back',
    'Order more supplies',
    'Attend a meeting',
    'A',
    'Dòng ví dụ mẫu TOEIC — thay bằng dữ liệu thật của bạn.',
    '1',
  ],
  [
    'Part 3',
    '',
    '',
    '',
    '',
    '',
    'When is the deadline for the report?',
    'MULTIPLE_CHOICE',
    'Monday morning',
    'Tuesday afternoon',
    'Wednesday noon',
    'Friday end of day',
    'B',
    '',
    '2',
  ],
  [
    'Part 3',
    '',
    '',
    '',
    '',
    '',
    'Where will the two speakers meet later?',
    'MULTIPLE_CHOICE',
    'At the office',
    'At a coffee shop',
    'At the airport',
    'Over the phone',
    'D',
    '',
    '3',
  ],
  [
    'Part 5',
    '-',
    '',
    '',
    '',
    '',
    'The marketing team will ___ the new campaign next week.',
    'MULTIPLE_CHOICE',
    'launch',
    'launches',
    'launching',
    'launched',
    'A',
    'Ghi "-" = câu hỏi trực tiếp (không group).',
    '1',
  ],
  [
    'Part 5',
    '-',
    '',
    '',
    '',
    '',
    'Employees must submit their expense reports ___ Friday.',
    'MULTIPLE_CHOICE',
    'by',
    'until',
    'during',
    'since',
    'C',
    '',
    '2',
  ],
];

/** One part/section of the target exam used to pre-fill the template. */
export interface ExamTemplateSection {
  name: string;
  questionCount: number;
}

export interface ExamTemplateOptions {
  /** Exam title — shown in the guide sheet and used for the file name. */
  title?: string;
  /** Exam parts/sections (position order) — pre-fills the Import sheet when present. */
  sections?: ExamTemplateSection[];
}

/** ASCII-safe download file name for the template. */
export function buildExamImportTemplateFileName(examTitle?: string): string {
  const base = (examTitle ?? '').trim();
  if (!base) return 'excel-import-template.xlsx';
  const slug = base
    .toLowerCase()
    .replace(/đ/g, 'd')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
    .replace(/-+$/, '');
  return slug ? `import-template-${slug}.xlsx` : 'excel-import-template.xlsx';
}

/**
 * Builds the downloadable .xlsx template (sheet "Import" + sheet "Hướng dẫn").
 * With `sections` (the exam's parts), the Import sheet gets one scaffold row
 * per part plus the expected question count in `expected_questions`.
 */
export function buildExamImportTemplateBuffer(
  options: ExamTemplateOptions = {},
): Buffer {
  const sections = (options.sections ?? []).filter(
    (section) => section.name.trim() !== '',
  );
  const examScoped = sections.length > 0;
  const columns: string[] = examScoped
    ? [...IMPORT_TEMPLATE_COLUMNS, 'expected_questions']
    : [...IMPORT_TEMPLATE_COLUMNS];

  const importRows: (string | number)[][] = [[...columns]];
  if (examScoped) {
    for (const section of sections) {
      const row: (string | number)[] = columns.map(() => '');
      row[0] = section.name.trim();
      if (section.questionCount > 0)
        row[columns.length - 1] = section.questionCount;
      importRows.push(row);
    }
  } else {
    importRows.push(...SAMPLE_ROWS);
  }

  const workbook = XLSX.utils.book_new();

  const importSheet = XLSX.utils.aoa_to_sheet(importRows);
  importSheet['!cols'] = columns.map((column) => ({
    wch: ['question', 'material_content', 'explanation'].includes(column)
      ? 40
      : 18,
  }));
  XLSX.utils.book_append_sheet(workbook, importSheet, 'Import');

  const guideSheet = XLSX.utils.aoa_to_sheet([
    ...buildGuideRows(options, sections, examScoped),
    ...EXAMPLE_ROWS,
  ]);
  guideSheet['!cols'] = [
    { wch: 30 },
    { wch: 90 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 40 },
    { wch: 20 },
    { wch: 22 },
    { wch: 22 },
    { wch: 22 },
    { wch: 22 },
    { wch: 18 },
    { wch: 36 },
    { wch: 10 },
  ];
  XLSX.utils.book_append_sheet(workbook, guideSheet, 'Hướng dẫn');

  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

/** Guide sheet rows, extended with the exam's parts when the template is exam-scoped. */
function buildGuideRows(
  options: ExamTemplateOptions,
  sections: ExamTemplateSection[],
  examScoped: boolean,
): (string | number)[][] {
  const guideRows: (string | number)[][] = GUIDE_ROWS.map((row) => [...row]);
  if (!examScoped) return guideRows;

  const title = options.title?.trim() || 'Đề thi';
  const total = sections.reduce(
    (sum, s) => sum + (s.questionCount > 0 ? s.questionCount : 0),
    0,
  );

  guideRows[0] = [`HƯỚNG DẪN IMPORT — ${title}`, ''];
  // Replace the generic sample note: exam-scoped templates ship scaffold rows instead.
  guideRows[guideRows.length - 1] = [
    'SHEET IMPORT — đã điền sẵn tên các phần thi của đề ở cột "section" và số câu dự kiến ở cột ' +
      '"expected_questions" (chỉ tham khảo, KHÔNG được import). Nhập dữ liệu vào các dòng DƯỚI mỗi ' +
      'phần thi; dòng nào chỉ có tên phần thi sẽ tự động bỏ qua.',
    '',
  ];
  guideRows.push(
    ['', ''],
    ['CÁC PHẦN THI CỦA ĐỀ NÀY', total > 0 ? `Tổng ${total} câu dự kiến` : ''],
    ...sections.map((section): (string | number)[] => [
      section.name,
      section.questionCount > 0
        ? `${section.questionCount} câu`
        : 'chưa đặt số câu',
    ]),
    [
      'Lưu ý',
      'Giữ nguyên dòng tiêu đề cột; cột "section" phải trùng tên phần thi (không phân biệt hoa/thường).',
    ],
  );
  return guideRows;
}
