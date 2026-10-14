/**
 * TOEIC Reading — Part 6: Text Completion (4 passages × 4 blanks = 16).
 * One TEXT material per group carries the passage with numbered blanks;
 * each question fills exactly one blank (4 options).
 */
import { SeedQuestion, mc, note } from '../types';

export interface Part6Group {
  title: string;
  passageType: string;
  text: string;
  questions: readonly [SeedQuestion, SeedQuestion, SeedQuestion, SeedQuestion];
}

export const PART6: Part6Group[] = [
  {
    title: 'Part 6 — Passage 1: E-mail about a vendor contract',
    passageType: 'E-mail',
    text: `Dear Ms. Kwan,

Thank you for (1) __________ with me last Tuesday about the vendor contract. I have reviewed the terms, and I believe we can (2) __________ the delivery schedule from monthly to biweekly without increasing the budget.

Please (3) __________ the attached agreement and return one signed copy by Friday. If you have any questions, contact me at extension 4471. (4) __________ , our legal team has already approved the revised clauses.

Sincerely,
Jordan Reyes
Procurement Manager`,
    questions: [
      mc(
        'Which word best completes blank (1) in the e-mail to Ms. Kwan?',
        ['met', 'meet', 'meeting', 'to meeting'],
        2,
        note(
          'Sau "Thank you for…" (for là giới từ) cần V-ing: "for meeting with me" — đây là lỗi thường gặp nhất của Part 6.',
          'vendor contract (n) — hợp đồng nhà cung cấp',
          'Trung cấp',
        ),
      ),
      mc(
        'Which word best completes blank (2) in the e-mail about the delivery schedule?',
        ['changing', 'change', 'changed', 'changes'],
        1,
        note(
          'Sau "can" (modal) luôn là động từ nguyên mẫu: "can change" — không thêm -ing/-ed/-s.',
          'delivery schedule (n) — lịch giao hàng',
          'Dễ',
        ),
      ),
      mc(
        'Which word best completes blank (3) in the e-mail requesting a signature?',
        ['reviewing', 'reviewed', 'reviews', 'review'],
        3,
        note(
          'Cấu trúc mệnh lệnh: "Please + động từ nguyên mẫu" → "Please review the attached agreement".',
          'review an agreement (v) — xem lại hợp đồng',
          'Dễ',
        ),
      ),
      mc(
        'Which word best completes blank (4) in the e-mail?',
        ['Otherwise', 'Furthermore', 'Nevertheless', 'Meanwhile'],
        1,
        note(
          'Câu sau bổ sung thêm một lý do tích cực (đội pháp lý đã duyệt) → "Furthermore" (hơn nữa); "otherwise" ngược điều kiện, "nevertheless" tương phản, "meanwhile" song song.',
          'furthermore (adv) — hơn nữa',
          'Khó',
        ),
      ),
    ],
  },
  {
    title: 'Part 6 — Passage 2: Notice about a temporary entrance closure',
    passageType: 'Notice',
    text: `NOTICE — Building A East Entrance

Please note that the east entrance of Building A will be (1) __________ from Monday through Wednesday while the flooring is being replaced.

Employees should use the west entrance, (2) __________ is located next to the parking structure. Delivery drivers must (3) __________ their vehicles in the visitor lot during this period.

We apologize for the (4) __________ and expect normal operations to resume on Thursday morning.

— Facilities Team`,
    questions: [
      mc(
        'Which word best completes blank (1) in the building notice?',
        ['closing', 'close', 'closed', 'closes'],
        2,
        note(
          'Bị động với "will be" → V3 "will be closed" (cửa bị đóng); "closing/close/closes" không đúng dạng sau "be".',
          'entrance (n) — lối vào',
          'Dễ',
        ),
      ),
      mc(
        'Which word best completes blank (2) in the notice?',
        ['that', 'what', 'which', 'where'],
        2,
        note(
          'Mệnh đề quan hệ không xác định sau dấu phẩy, chỉ vật ("west entrance") → "which"; "that" không dùng sau dấu phẩy, "what" không có từ được thay thế, "where" chỉ nơi chốn.',
          'parking structure (n) — kết cấu bãi đỗ',
          'Khó',
        ),
      ),
      mc(
        'Which word best completes blank (3) for delivery drivers?',
        ['parked', 'park', 'parking', 'to parked'],
        1,
        note(
          '"must" là modal → động từ nguyên mẫu "must park"; các dạng khác sai sau modal.',
          'visitor lot (n) — bãi đỗ khách',
          'Dễ',
        ),
      ),
      mc(
        'Which word best completes blank (4) in the notice’s apology?',
        ['convenient', 'inconvenience', 'conveniently', 'inconvenienced'],
        1,
        note(
          'Cố định "apologize for the inconvenience" (xin vì sự bất tiện) — danh từ; "convenient" nghĩa ngược, "inconvenienced" là quá khứ tính từ.',
          'inconvenience (n) — sự bất tiện',
          'Trung cấp',
        ),
      ),
    ],
  },
  {
    title: 'Part 6 — Passage 3: Advertisement for an office cabinet',
    passageType: 'Advertisement',
    text: `Introducing the Vault-400 filing cabinet — the (1) __________ solution for offices that need secure storage without sacrificing style.

Made from recycled steel, the Vault-400 (2) __________ a full ten-year guarantee. Each unit arrives fully assembled, so you can (3) __________ it into your office right away.

Order before the end of this month and receive free (4) __________ to any business address in the region.

Visit vaultoffice.com or call 800-555-0119.`,
    questions: [
      mc(
        'Which word best completes blank (1) in the cabinet advertisement?',
        ['ideal', 'ideally', 'ideals', 'ideality'],
        0,
        note(
          'Cần tính từ bổ nghĩa cho danh từ "solution" → "the ideal solution"; "ideally" trạng từ, "ideals" danh từ số nhiều, "ideality" rất hiếm.',
          'ideal (adj) — lý tưởng',
          'Dễ',
        ),
      ),
      mc(
        'Which word best completes blank (2) in the advertisement?',
        ['include', 'included', 'includes', 'including'],
        2,
        note(
          'Chủ ngữ số ít "the Vault-400" → động từ ở hiện tại đơn thêm -s: "includes a full ten-year guarantee".',
          'guarantee (n) — bảo hành, cam kết',
          'Trung cấp',
        ),
      ),
      mc(
        'Which word best completes blank (3) in the advertisement?',
        ['moving', 'move', 'moved', 'movement'],
        1,
        note(
          'Sau "can" dùng nguyên mẫu: "you can move it into your office".',
          'assemble (v) — lắp ráp',
          'Dễ',
        ),
      ),
      mc(
        'Which word best completes blank (4) in the advertisement?',
        ['delivered', 'delivering', 'delivery', 'deliver'],
        2,
        note(
          'Sau "free" cần danh từ: "free delivery" — collocation quen thuộc trong quảng cáo; các dạng còn lại là động từ/tính từ.',
          'free delivery (n) — giao hàng miễn phí',
          'Dễ',
        ),
      ),
    ],
  },
  {
    title: 'Part 6 — Passage 4: Web-site announcement about a new portal',
    passageType: 'Web site',
    text: `Employee Portal Update

The new employee portal goes (1) __________ at 9 a.m. on Monday. To log in for the first time, use your staff ID together with the temporary password (2) __________ in your welcome e-mail.

The portal (3) __________ you to update your bank details, request vacation days, and download payslips from any device.

If you experience problems, please report them (4) __________ the help desk form instead of calling the IT hotline.

— Human Resources`,
    questions: [
      mc(
        'Which word best completes blank (1) in the portal announcement?',
        ['lively', 'lives', 'live', 'alive'],
        2,
        note(
          'Cố định "go live" = ra mắt, hoạt động chính thức (cùng nghĩa với launch); "alive/s lively" không đi sau "go" trong ngữ cảnh này.',
          'go live (phrasal) — chính thức hoạt động',
          'Trung cấp',
        ),
      ),
      mc(
        'Which word best completes blank (2) in the portal announcement?',
        ['sending', 'sent', 'sends', 'send'],
        1,
        note(
          'Phương ngữ giảm lược "the password (which was) sent in your welcome e-mail" → quá khứ phân từ "sent"; đây là danh từ bị động.',
          'temporary password (n) — mật khẩu tạm',
          'Trung cấp',
        ),
      ),
      mc(
        'Which word best completes blank (3) in the portal announcement?',
        ['allow', 'allows', 'allowed', 'allowing'],
        1,
        note(
          'Chủ ngữ "The portal" số ít, hiện tại đơn → "allows you to update…" (cho phép bạn).',
          'payslip (n) — phiếu lương',
          'Dễ',
        ),
      ),
      mc(
        'Which word best completes blank (4) in the portal announcement?',
        ['through', 'across', 'along', 'beside'],
        0,
        note(
          '"report something through a form" = báo cáo thông qua biểu mẫu; "across/along" chỉ không gian, "beside" bên cạnh — không hợp.',
          'help desk form (n) — biểu mẫu hỗ trợ',
          'Trung cấp',
        ),
      ),
    ],
  },
];

export const PART6_COUNT = 4;
