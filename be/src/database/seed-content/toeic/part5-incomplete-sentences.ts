/**
 * TOEIC Reading — Part 5: Incomplete Sentences (30 questions, 4 options).
 * These are the section's DIRECT questions — the student UI renders them
 * before the Part 6/7 groups.
 */
import { SeedQuestion, mc, note } from '../types';

export const PART5: SeedQuestion[] = [
  mc(
    'By the time the auditors arrive next week, the accounting team ______ all of the financial statements.',
    ['will have completed', 'completes', 'has completed', 'is completing'],
    0,
    note(
      'Mốc "by the time + hiện tại" chỉ việc hoàn thành TRƯỚC một thời điểm tương lai → phải dùng tương lai hoàn thành (will have completed).',
      'financial statement (n) — báo cáo tài chính',
      'Khó',
    ),
  ),
  mc(
    'All travel expenses must be submitted ______ the fifteenth of each month.',
    ['by', 'in', 'at', 'during'],
    0,
    note(
      '"by + mốc thời gian" = chậm nhất vào thời điểm đó (hạn chót); "in" dùng với tháng/năm, "at" với giờ, "during" với giai đoạn.',
      'submit expenses (v) — nộp chi phí',
      'Dễ',
    ),
  ),
  mc(
    '______ the shipment was delayed, the client still praised our team for its responsiveness.',
    ['Although', 'Because of', 'Due to', 'So'],
    0,
    note(
      '"Although" là liên từ dẫn dắt mệnh đề (kèm chủ ngữ + động từ) thể hiện tương phản; "because of/due to" chỉ dẫn danh từ, "so" là kết quả — cả ba đều sai ngữ cảnh.',
      'responsiveness (n) — sự phản hồi nhanh chóng',
      'Trung cấp',
    ),
  ),
  mc(
    'The new safety instructions are clearly ______, so every employee can follow them easily.',
    ['written', 'writing', 'wrote', 'writer'],
    0,
    note(
      'Cấu trúc bị động "are written" (be + V3) sau "instructions"; danh từ "writer" và động từ "wrote/writing" không khớp vị trí sau "are".',
      'instruction (n) — hướng dẫn',
      'Dễ',
    ),
  ),
  mc(
    'Because of the storm, the board decided to ______ the shareholders’ meeting until Friday.',
    ['postpone', 'prefer', 'pretend', 'predict'],
    0,
    note(
      '"postpone" = hoãn lại, đi cùng với "meeting"; "prefer" thích hơn, "pretend" giả vờ, "predict" dự đoán — đều không hợp với object "meeting".',
      'postpone (v) — hoãn lại',
      'Dễ',
    ),
  ),
  mc(
    'The engineers will ______ a series of tests on the prototype before it goes into production.',
    ['carry out', 'carry on', 'carry off', 'carry up'],
    0,
    note(
      '"carry out" = thực hiện (bài kiểm tra, thí nghiệm); "carry on" tiếp tục, "carry off" giành được, "carry up" không phải cụm từ chuẩn.',
      'carry out tests (v) — tiến hành thử nghiệm',
      'Trung cấp',
    ),
  ),
  mc(
    'The manager, ______ department recorded the highest sales, received a bonus in October.',
    ['whose', 'who', 'which', 'whom'],
    0,
    note(
      'Đứng trước danh từ "department" chỉ sở hữu → dùng "whose" (mặc định nghĩa là "of whom"); "who/whom" không kèm danh từ sở hữu, "which" không dùng cho người.',
      'bonus (n) — tiền thưởng',
      'Khó',
    ),
  ),
  mc(
    'The renovation of the lobby ______ before the holiday season begins.',
    ['will be completed', 'will complete', 'completing', 'has completing'],
    0,
    note(
      'Chủ ngữ "renovation" là vật, bị động và mốc tương lai → "will be completed"; "will complete" là chủ động sai nghĩa (công trình không tự hoàn thành mình).',
      'renovation (n) — cải tạo, tu sửa',
      'Trung cấp',
    ),
  ),
  mc(
    'Please do not discuss the merger ______ the phone; send me a written confirmation instead.',
    ['on', 'in', 'at', 'by'],
    0,
    note(
      'Cố định: "on the phone" (trên điện thoại); "by phone" cũng đúng nếu bỏ "the" — nhưng với "the phone" phải dùng "on".',
      'merger (n) — vụ sáp nhập',
      'Dễ',
    ),
  ),
  mc(
    'There were ______ complaints from customers this quarter than in any previous quarter.',
    ['fewer', 'less', 'lesser', 'few'],
    0,
    note(
      '"complaints" là danh từ đếm được nên dùng "fewer" + so sánh hơn "than"; "less" cho danh từ không đếm được, "few" không kèm "than".',
      'complaint (n) — khiếu nại',
      'Trung cấp',
    ),
  ),
  mc(
    'If the supplier ______ the parts on time, we would not have to delay the launch.',
    ['had delivered', 'delivers', 'will deliver', 'would deliver'],
    0,
    note(
      'Câu điều kiện loại 3 (viễn cảnh quá khứ — hệ quả đã xảy ra trong quá khứ): If + past perfect → would not have to…; các đáp án khác sai thì.',
      'delay the launch (v) — trì hoãn ra mắt',
      'Khó',
    ),
  ),
  mc(
    'Employees may claim up to $60 per day for meals while travelling on business.',
    ['claim', 'climb', 'declare', 'demand'],
    0,
    note(
      '"claim" = yêu cầu nhận lại tiền (chi phí) — collocation "claim expenses"; "declare" khai báo (thuế/quan), "demand" đòi hỏi, "leo núi" là climb.',
      'claim expenses (v) — yêu cầu hoàn chi phí',
      'Trung cấp',
    ),
  ),
  mc(
    'After several ______, the marketing brochure was finally approved by the director.',
    ['revisions', 'revise', 'revised', 'revisioning'],
    0,
    note(
      'Sau "several" cần danh từ đếm được số nhiều → "revisions"; "revise" là động từ, "revised" là quá khứ/tính từ.',
      'revision (n) — bản sửa đổi',
      'Dễ',
    ),
  ),
  mc(
    'The invoice is overdue; ______, the supplier may suspend our account.',
    ['otherwise', 'however', 'moreover', 'although'],
    0,
    note(
      '"Otherwise" = không nếu không như vậy (kết quả của điều kiện trên); "however" tương phản, "moreover" bổ sung, "although" dẫn mệnh đề — đều sai logic.',
      'suspend an account (v) — tạm ngưng tài khoản',
      'Khó',
    ),
  ),
  mc(
    'Ms. Ferreira speaks three languages, so she was chosen as ______ representative for the conference.',
    ['the', 'a', 'an', 'one'],
    0,
    note(
      'Danh từ "representative" ở đây là duy nhất trong ngữ cảnh (đại diện duy nhất được chọn) → dùng "mạo từ xác định the"; "a/an" chưa xác định, "one" không đúng cấu trúc.',
      'representative (n) — đại diện',
      'Trung cấp',
    ),
  ),
  mc(
    'We are looking forward to ______ from you with the revised quotation.',
    ['hearing', 'hear', 'heard', 'have heard'],
    0,
    note(
      '"look forward to" là giới từ "to" nên theo sau phải là V-ing: "hearing" — lỗi sai rất phổ biến khi nhầm với cấu trúc to-infinitive.',
      'look forward to (v) — mong chờ',
      'Dễ',
    ),
  ),
  mc(
    'Before the contract is signed, both parties must ______ a decision on the delivery schedule.',
    ['make', 'do', 'take', 'put'],
    0,
    note(
      'Cố định: "make a decision" (ra quyết định); "do/take/put" không đi cùng "decision" trong tiếng Anh chuẩn.',
      'make a decision (v) — ra quyết định',
      'Dễ',
    ),
  ),
  mc(
    'When the sales representative entered the room, everyone ______ quietly at their desks.',
    ['was working', 'has worked', 'works', 'had been working since'],
    0,
    note(
      'Một hành động đang diễn ra ("was working") tại một mốc quá khứ khi hành động khác xảy ra → quá khứ tiếp diễn; các đáp án khác sai thì hoặc sai cấu trúc.',
      'sales representative (n) — nhân viên kinh doanh',
      'Trung cấp',
    ),
  ),
  mc(
    'Passengers should arrive at ______ airport at least two hours before departure.',
    ['the', 'a', 'an', '—'],
    0,
    note(
      'Sau "at" với danh từ địa điểm duy nhất, quen thuộc dùng "the airport"; bỏ mạo từ (option D) khiến câu thiếu_articles nên sai trong văn bản chuẩn.',
      'departure (n) — khởi hành',
      'Dễ',
    ),
  ),
  mc(
    'The training program was designed ______ new hires could learn the software quickly.',
    ['so that', 'although', 'despite', 'unless'],
    0,
    note(
      '"so that" + chủ ngữ + động từ diễn đạt MỤC ĐÍCH (để mà…); "although/despite" là tương phản, "unless" là điều kiện — sai logic câu.',
      'new hire (n) — nhân viên mới',
      'Trung cấp',
    ),
  ),
  mc(
    'The board granted ______ to the proposed budget after a short discussion.',
    ['approval', 'approve', 'approving', 'approvable'],
    0,
    note(
      'Sau "granted" cần danh từ: "grant approval to" = phê chuẩn; "approve" là động từ, "approving" V-ing, "approvable" tính từ hiếm không dùng here.',
      'grant approval (v) — trao sự phê chuẩn',
      'Trung cấp',
    ),
  ),
  mc(
    'The proposal is ______ because the estimated costs exceed the available budget.',
    ['unfeasible', 'unfaint', 'unfamiliar', 'unfavorably'],
    0,
    note(
      '"unfeasible" = không khả thi (feasible → un-); vì chi phí vượt ngân sách nên đề xuất KHÔNG khả thi. "unfamiliar" quen thuộc, "unfavorably" bất lợi (trạng từ).',
      'feasible (adj) — khả thi',
      'Khó',
    ),
  ),
  mc(
    'The loading dock is congested in the morning, so drivers usually unload ______ after ten.',
    ['their trucks', 'them', 'theirs', 'themselves'],
    0,
    note(
      'Cần đại từ sở hữu + danh từ "their trucks" (chủ động); "them" là tân ngữ, "theirs" thiếu danh từ, "themselves" là phản thân sai nghĩa.',
      'loading dock (n) — cửa tải, bến bốc dỡ',
      'Trung cấp',
    ),
  ),
  mc(
    'The HR director recommended that every new employee ______ the code of conduct.',
    ['read', 'reads', 'reading', 'must read'],
    0,
    note(
      'Sau "recommend that" dùng cấu trúc giả định: động từ nguyên mẫu "read" (không s/es, không "to"). "must read" bị loại vìrecommend + that không dùng modal.',
      'code of conduct (n) — quy tắc ứng xử',
      'Khó',
    ),
  ),
  mc(
    'The manager asked her assistant to ______ the deadline until the client sends the missing data.',
    ['extend', 'expand', 'expel', 'expect'],
    0,
    note(
      '"extend a deadline" = gia hạn hạn chót; "expand" mở rộng (quy mô), "expel" trục xuất, "expect" mong đợi — chỉ "extend" đi cùng với deadline.',
      'extend a deadline (v) — gia hạn',
      'Trung cấp',
    ),
  ),
  mc(
    'The report is well researched; ______, its recommendations are too vague to implement.',
    ['however', 'therefore', 'for example', 'in addition'],
    0,
    note(
      'Mệnh đề 2 trái ngược với lời khen ở mệnh đề 1 → "however" (tuy nhiên); "therefore" kết quả, "for example" ví dụ, "in addition" bổ sung đều không phải tương phản.',
      'vague (adj) — mơ hồ',
      'Trung cấp',
    ),
  ),
  mc(
    'All employees must wear identification badges ______ company premises.',
    ['on', 'in', 'to', 'at'],
    0,
    note(
      '"on the premises/within the premises" là collocation chuẩn cho khuôn viên (tòa nhà, nhà máy); "in premises" không dùng trong tiếng Anh công sở.',
      'premises (n) — cơ sở, khuôn viên',
      'Khó',
    ),
  ),
  mc(
    'The technician checked each cable ______ to make sure no connections were loose.',
    ['carefully', 'care', 'careful', 'caring'],
    0,
    note(
      'Cần trạng từ bổ nghĩa cho động từ "checked" → "carefully"; "careful" tính từ, "care" danh từ/động từ, "caring" không phù hợp.',
      'loose connection (n) — mối nối lỏng',
      'Dễ',
    ),
  ),
  mc(
    'The account manager uses a spreadsheet to keep ______ of her clients’ orders.',
    ['track', 'trail', 'trace', 'record of'],
    0,
    note(
      'Cố định: "keep track of" = theo dõi, nắm thông tin; "keep record of" phải dùng số nhiều "records" nên option D sai cấu trúc.',
      'keep track of (idiom) — theo dõi',
      'Trung cấp',
    ),
  ),
  mc(
    '______ the marketing team finishes its research, it will present the findings to the committee.',
    ['Once', 'Until', 'Unless', 'Despite'],
    0,
    note(
      '"Once" = khi mà/một khi (chỉ điều kiện thời gian) dẫn dắt mệnh đề có chủ ngữ+động từ; "until" chờ tới khi (ý nghĩa không khớp), "despite" là giới từ, "unless" nghĩa ngược lại.',
      'finding (n) — phát hiện, kết quả nghiên cứu',
      'Trung cấp',
    ),
  ),
];

export const PART5_COUNT = 30;
