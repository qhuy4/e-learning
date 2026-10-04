/**
 * TOEIC Listening — Part 1: Photographs (6 questions, 4 options each).
 *
 * Each item gets its own question group carrying two materials:
 *   position 1 → IMAGE placeholder (rendered first by the FE)
 *   position 2 → AUDIO placeholder (stored with a path, no transcript —
 *                the transcript would give the answer away).
 */
import { SeedQuestion, mc, note } from '../types';

export interface Part1Item {
  /** Short scene label (Vietnamese) used as the material title. */
  scene: string;
  image: string;
  audio: string;
  question: SeedQuestion;
}

export const PART1: Part1Item[] = [
  {
    scene: 'Phòng họp — người phụ nữ thuyết trình trước bảng trắng',
    image: '/images/toeic/part1-01.jpg',
    audio: '/audio/toeic/part1-01.mp3',
    question: mc(
      'Which statement best describes what the woman in the photograph is doing?',
      [
        'She is presenting a chart to her colleagues.',
        'She is signing a contract at her desk.',
        'She is stacking boxes on a shelf.',
        'She is waiting for an elevator.',
      ],
      0,
      note(
        '"present a chart to sb" = trình bày biểu đồ cho ai; người trong ảnh đang chỉ vào bảng trắng và nói với nhóm đồng nghiệp. Ba lựa chọn khác mô tả hành động không có trong ảnh.',
        'present (v) — trình bày',
        'Dễ',
      ),
    ),
  },
  {
    scene: 'Kho hàng — nhân viên chất thùng lên xe tải',
    image: '/images/toeic/part1-02.jpg',
    audio: '/audio/toeic/part1-02.mp3',
    question: mc(
      'What are the workers in the photograph doing?',
      [
        'They are loading cartons onto a delivery truck.',
        'They are unloading the truck into the warehouse.',
        'They are counting inventory on a clipboard.',
        'They are repairing a forklift.',
      ],
      0,
      note(
        '"load A onto B" = chất A lên B (đang làm, chưa xong) — thùng vẫn nằm trên xe đẩy về phía thùng xe. "Unload" là dỡ hàng xuống, ngược với hình ảnh.',
        'load (v) — chất hàng, bốc hàng',
        'Trung cấp',
      ),
    ),
  },
  {
    scene: 'Nhà hàng — người phục vụ mang đĩa thức ăn ra bàn',
    image: '/images/toeic/part1-03.jpg',
    audio: '/audio/toeic/part1-03.mp3',
    question: mc(
      'Which action is the server in the picture performing?',
      [
        'He is carrying plates of food to a table.',
        'He is taking an order from the customers.',
        'He is washing dishes in the kitchen.',
        'He is reading the menu at the counter.',
      ],
      0,
      note(
        '"carry plates of food to a table" khớp với hình ảnh người phục vụ đang bưng đĩa di chuyển. "Take an order" chỉ ghi món, không mô tả việc đang làm.',
        'server (n) — người phục vụ',
        'Dễ',
      ),
    ),
  },
  {
    scene: 'Công trường — kỹ sư xem bản vẽ trước khi thi công',
    image: '/images/toeic/part1-04.jpg',
    audio: '/audio/toeic/part1-04.mp3',
    question: mc(
      'What is the man in the safety helmet reviewing in the photo?',
      [
        'Construction plans',
        'Employee time sheets',
        'Customer invoices',
        'A training video',
      ],
      0,
      note(
        '"construction plans/bản vẽ xây dựng" là thứ kỹ sư cầm trên tay; "review" = xem lại. Các lựa chọn khác là giấy tờ văn phòng, không liên quan công trường.',
        'construction plan (n) — bản vẽ/hoàn đồ thi công',
        'Trung cấp',
      ),
    ),
  },
  {
    scene: 'Sân bay — hành khách làm thủ tục tại quầy check-in',
    image: '/images/toeic/part1-05.jpg',
    audio: '/audio/toeic/part1-05.mp3',
    question: mc(
      'Where are the people in the photograph most likely standing?',
      [
        'At an airline check-in counter',
        'In a hotel conference room',
        'At a restaurant host stand',
        'Inside a baggage cart',
      ],
      0,
      note(
        '"check-in counter" = quầy làm thủ tục lên máy bay; vali + nhân viên đồng phục sân bay là manh mối chính. Các địa điểm còn lại không có vali/khu vực làm thủ tục.',
        'check in (v) — làm thủ tục (sân bay)',
        'Trung cấp',
      ),
    ),
  },
  {
    scene: 'Văn phòng — nhân viên xếp hồ sơ vào tủ tài liệu',
    image: '/images/toeic/part1-06.jpg',
    audio: '/audio/toeic/part1-06.mp3',
    question: mc(
      'Which statement best describes the scene shown in the photograph?',
      [
        'A man is filing documents in a filing cabinet.',
        'A woman is shredding confidential papers.',
        'A group is unpacking new office equipment.',
        'Two employees are arguing over a desk.',
      ],
      0,
      note(
        '"file documents" = xếp/hồ sơ vào tủ; hình ảnh cho thấy người đàn ông đang đặt hồ sơ vào tủ tài liệu mở. "Shred" là cắt vụn giấy, không thấy trong ảnh.',
        'file (v) — xếp hồ sơ',
        'Dễ',
      ),
    ),
  },
];

export const PART1_COUNT = 6;
